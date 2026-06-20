"""Deploy catalog performance improvements to production."""

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

BACKEND_FILES = [
    "backend/Dockerfile",
    "backend/package.json",
    "backend/package-lock.json",
    "backend/tsconfig.json",
    "backend/tsconfig.build.json",
    "backend/nest-cli.json",
    "docker-compose.prod.server.yml",
]

SKIP_PARTS = {"node_modules", ".next", "__pycache__", ".git"}


def pack_repo() -> bytes:
    buf = io.BytesIO()
    with tarfile.open(fileobj=buf, mode="w:gz") as tar:
        web_dir = REPO / "web"
        for path in web_dir.rglob("*"):
            if path.is_file() and not SKIP_PARTS.intersection(path.parts):
                tar.add(path, arcname=f"web/{path.relative_to(web_dir).as_posix()}")

        prisma_dir = REPO / "backend" / "prisma"
        for path in prisma_dir.rglob("*"):
            if path.is_file():
                tar.add(path, arcname=f"backend/prisma/{path.relative_to(prisma_dir).as_posix()}")

        src_dir = REPO / "backend" / "src"
        for path in src_dir.rglob("*"):
            if path.is_file():
                tar.add(path, arcname=f"backend/src/{path.relative_to(src_dir).as_posix()}")

        for rel in BACKEND_FILES:
            path = REPO / rel
            if path.is_file():
                tar.add(path, arcname=rel.replace("\\", "/"))
    return buf.getvalue()


def run(client: paramiko.SSHClient, cmd: str, timeout: int = 1200) -> int:
    print(f"> {cmd[:120]}{'...' if len(cmd) > 120 else ''}", flush=True)
    _, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode("utf-8", errors="replace")
    err = stderr.read().decode("utf-8", errors="replace")
    code = stdout.channel.recv_exit_status()
    if out.strip():
        safe = out[-5000:].encode("ascii", errors="replace").decode("ascii")
        print(safe, flush=True)
    if err.strip() and code != 0:
        print(err[-3000:].encode("ascii", errors="replace").decode("ascii"), file=sys.stderr, flush=True)
    return code


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

    remote_tar = "/tmp/catalog-perf-sync.tar.gz"
    sftp = client.open_sftp()
    with sftp.open(remote_tar, "wb") as rf:
        rf.write(payload)
    sftp.close()

    steps = [
        f"mkdir -p {REMOTE_DIR} && tar -xzf {remote_tar} -C {REMOTE_DIR}",
        (
            f"cd {REMOTE_DIR} && docker compose -f docker-compose.prod.server.yml --env-file .env "
            f"up -d --build api web"
        ),
        (
            f"cd {REMOTE_DIR} && docker compose -f docker-compose.prod.server.yml --env-file .env "
            f"exec -T api npx prisma migrate deploy"
        ),
    ]
    for cmd in steps:
        if run(client, cmd) != 0:
            sys.exit(1)

    checks = [
        "curl -sf -o /dev/null -w 'katalog:%{http_code} ' http://127.0.0.1/katalog",
        "curl -sf -o /dev/null -w 'stores_summary:%{http_code} ' http://127.0.0.1:3001/api/v1/stores/summary",
        "curl -sf -o /dev/null -w 'products_card:%{http_code} ' 'http://127.0.0.1:3001/api/v1/products?limit=24&view=card'",
    ]
    print("Smoke checks:", end=" ", flush=True)
    for cmd in checks:
        _, stdout, _ = client.exec_command(cmd)
        print(stdout.read().decode("utf-8", errors="replace"), end=" ", flush=True)
    print(flush=True)

    client.close()
    print("Catalog perf deploy complete.", flush=True)


if __name__ == "__main__":
    main()
