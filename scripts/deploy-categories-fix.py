"""Deploy category UI + API changes and re-import DRC catalog on production."""

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

INCLUDE = [
    "backend/src/categories",
    "backend/src/common/mappers.ts",
    "backend/scripts/drc-catalog.json",
    "backend/scripts/drc-utils.ts",
    "backend/scripts/import-drc-catalog.ts",
    "backend/scripts/resolve-store.ts",
    "web/src/app/(storefront)/katalog",
    "web/src/components/storefront/category-sidebar.tsx",
    "web/src/components/storefront/home/popular-categories-grid.tsx",
    "web/src/lib/mobile-assets.ts",
    "web/src/lib/types.ts",
    "web/src/lib/utils.ts",
]


def pack_repo() -> bytes:
    buf = io.BytesIO()
    with tarfile.open(fileobj=buf, mode="w:gz") as tar:
        for rel in INCLUDE:
            path = REPO / rel
            if path.is_file():
                tar.add(path, arcname=rel.replace("\\", "/"))
            elif path.is_dir():
                for file in path.rglob("*"):
                    if file.is_file() and "node_modules" not in file.parts:
                        arc = file.relative_to(REPO).as_posix()
                        tar.add(file, arcname=arc)
            else:
                print(f"skip missing {rel}", flush=True)
    return buf.getvalue()


def main() -> None:
    passphrase = os.environ.get("SSH_KEY_PASSPHRASE")
    if not passphrase:
        print("SSH_KEY_PASSPHRASE required", file=sys.stderr)
        sys.exit(1)

    payload = pack_repo()
    print(f"Archive {len(payload)/1024/1024:.1f} MB", flush=True)

    key = paramiko.RSAKey.from_private_key_file(str(KEY_PATH), password=passphrase)
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, username=USER, pkey=key, timeout=60)

    remote_tar = "/tmp/drc-categories-sync.tar.gz"
    sftp = client.open_sftp()
    with sftp.open(remote_tar, "wb") as rf:
        rf.write(payload)
    sftp.close()

    cmds = [
        f"mkdir -p {REMOTE_DIR} && tar -xzf {remote_tar} -C {REMOTE_DIR}",
        (
            f"cd {REMOTE_DIR} && docker compose -f docker-compose.prod.server.yml --env-file .env "
            f"up -d --build api web"
        ),
        (
            "docker exec ecommerce-backend sh -c 'cd /app && "
            "npx ts-node --transpile-only scripts/import-drc-catalog.ts'"
        ),
    ]
    for cmd in cmds:
        print(">", cmd[:90], flush=True)
        _, stdout, stderr = client.exec_command(cmd, timeout=900)
        out = stdout.read().decode("utf-8", errors="replace")
        err = stderr.read().decode("utf-8", errors="replace")
        code = stdout.channel.recv_exit_status()
        if out.strip():
            print(out[-3000:], flush=True)
        if code != 0:
            print(err[-2000:], file=sys.stderr)
            sys.exit(code)

    _, stdout, _ = client.exec_command(
        "curl -sf http://127.0.0.1:3001/api/v1/categories | head -c 400"
    )
    print("Categories sample:", stdout.read().decode("utf-8", errors="replace")[:400], flush=True)
    client.close()
    print("Done.", flush=True)


if __name__ == "__main__":
    main()
