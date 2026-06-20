"""Sync web/ to production and rebuild web container."""

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


def main() -> None:
    passphrase = os.environ.get("SSH_KEY_PASSPHRASE")
    if not passphrase:
        print("SSH_KEY_PASSPHRASE is required.", file=sys.stderr)
        sys.exit(1)

    web_dir = REPO / "web"
    if not web_dir.exists():
        print(f"Missing {web_dir}", file=sys.stderr)
        sys.exit(1)

    print("Packing web/ ...", flush=True)
    buf = io.BytesIO()
    with tarfile.open(fileobj=buf, mode="w:gz") as tar:
        for path in web_dir.rglob("*"):
            if path.is_file() and "node_modules" not in path.parts and ".next" not in path.parts:
                tar.add(path, arcname=f"web/{path.relative_to(web_dir).as_posix()}")
    payload = buf.getvalue()
    print(f"Archive: {len(payload) / 1024 / 1024:.1f} MB", flush=True)

    key = paramiko.RSAKey.from_private_key_file(str(KEY_PATH), password=passphrase)
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, username=USER, pkey=key, timeout=60)
    print(f"Connected to {HOST}", flush=True)

    remote_tar = "/tmp/web-sync.tar.gz"
    sftp = client.open_sftp()
    with sftp.open(remote_tar, "wb") as rf:
        rf.write(payload)
    sftp.close()

    cmds = [
        f"mkdir -p {REMOTE_DIR} && tar -xzf {remote_tar} -C {REMOTE_DIR}",
        (
            f"cd {REMOTE_DIR} && "
            f"docker compose -f docker-compose.prod.server.yml --env-file .env "
            f"up -d --build web"
        ),
    ]
    for cmd in cmds:
        print(f"> {cmd[:90]}...", flush=True)
        _, stdout, stderr = client.exec_command(cmd, timeout=900)
        out = stdout.read().decode()
        err = stderr.read().decode()
        code = stdout.channel.recv_exit_status()
        if out:
            print(out[-2000:], flush=True)
        if code != 0:
            print(err, file=sys.stderr)
            sys.exit(code)

    _, stdout, _ = client.exec_command("curl -sf -o /dev/null -w '%{http_code}' http://127.0.0.1/katalog")
    print(f"Katalog HTTP: {stdout.read().decode()}", flush=True)
    client.close()
    print("Web deploy complete.", flush=True)


if __name__ == "__main__":
    main()
