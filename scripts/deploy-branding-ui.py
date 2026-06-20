"""Sync web/ + backend products API and rebuild api + web on production."""

from __future__ import annotations

import io
import os
import sys
import tarfile
from pathlib import Path

import paramiko

HOST = os.environ.get("DEPLOY_HOST", "167.172.168.81")
USER = os.environ.get("DEPLOY_USER", "root")
KEY_PATH = Path(os.path.expanduser("~")) / ".ssh" / "id_rsa"
REPO = Path(__file__).resolve().parent.parent
REMOTE_DIR = os.environ.get("DEPLOY_DIR", "/opt/durmusbaba")

BACKEND_INCLUDE = [
    "backend/src/products/products.controller.ts",
    "backend/src/products/products.service.ts",
]


def pack_repo() -> bytes:
    buf = io.BytesIO()
    with tarfile.open(fileobj=buf, mode="w:gz") as tar:
        web_dir = REPO / "web"
        for path in web_dir.rglob("*"):
            if path.is_file() and "node_modules" not in path.parts and ".next" not in path.parts:
                tar.add(path, arcname=f"web/{path.relative_to(web_dir).as_posix()}")

        for rel in BACKEND_INCLUDE:
            path = REPO / rel
            if path.is_file():
                tar.add(path, arcname=rel.replace("\\", "/"))
    return buf.getvalue()


def main() -> None:
    passphrase = os.environ.get("SSH_KEY_PASSPHRASE")
    if not passphrase:
        print("SSH_KEY_PASSPHRASE is required.", file=sys.stderr)
        sys.exit(1)

    payload = pack_repo()
    print(f"Archive: {len(payload) / 1024 / 1024:.1f} MB", flush=True)

    key = paramiko.RSAKey.from_private_key_file(str(KEY_PATH), password=passphrase)
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, username=USER, pkey=key, timeout=60)
    print(f"Connected to {HOST}", flush=True)

    remote_tar = "/tmp/branding-ui-sync.tar.gz"
    sftp = client.open_sftp()
    with sftp.open(remote_tar, "wb") as rf:
        rf.write(payload)
    sftp.close()

    cmds = [
        f"mkdir -p {REMOTE_DIR} && tar -xzf {remote_tar} -C {REMOTE_DIR}",
        (
            f"cd {REMOTE_DIR} && "
            f"docker compose -f docker-compose.prod.server.yml --env-file .env "
            f"up -d --build api web"
        ),
    ]
    for cmd in cmds:
        print(f"> {cmd[:100]}...", flush=True)
        _, stdout, stderr = client.exec_command(cmd, timeout=1200)
        out = stdout.read().decode("utf-8", errors="replace")
        err = stderr.read().decode("utf-8", errors="replace")
        code = stdout.channel.recv_exit_status()
        if out.strip():
            safe = out[-4000:].encode("ascii", errors="replace").decode("ascii")
            print(safe, flush=True)
        if code != 0:
            print(err[-2000:], file=sys.stderr)
            sys.exit(code)

    checks = [
        "curl -sf -o /dev/null -w 'home:%{http_code}' http://127.0.0.1/",
        "curl -sf -o /dev/null -w ' katalog:%{http_code}' http://127.0.0.1/katalog",
        "curl -sf -o /dev/null -w ' sort_newest:%{http_code}' 'http://127.0.0.1:3001/api/v1/products?limit=1&sort=newest'",
        "curl -sf -o /dev/null -w ' sort_best:%{http_code}' 'http://127.0.0.1:3001/api/v1/products?limit=1&sort=bestselling'",
    ]
    for cmd in checks:
        _, stdout, _ = client.exec_command(cmd)
        print(stdout.read().decode("utf-8", errors="replace"), end=" ", flush=True)
    print(flush=True)

    client.close()
    print("Branding UI deploy complete.", flush=True)


if __name__ == "__main__":
    main()
