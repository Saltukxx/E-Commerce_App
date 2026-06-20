"""Upload backend/uploads/products to production server via tar + docker cp."""

from __future__ import annotations

import os
import subprocess
import sys
import tarfile
import tempfile
from pathlib import Path

import paramiko

HOST = os.environ.get("DEPLOY_HOST", "167.172.168.81")
USER = os.environ.get("DEPLOY_USER", "root")
KEY_PATH = Path(os.path.expanduser("~")) / ".ssh" / "id_rsa"
LOCAL_DIR = Path(__file__).resolve().parent.parent / "uploads" / "products"
REMOTE_TAR = "/tmp/durmus-product-images.tar.gz"
IMAGE_GLOBS = ("*.jpg", "*.jpeg", "*.png", "*.webp")


def log(msg: str) -> None:
    print(msg, flush=True)


def main() -> None:
    passphrase = os.environ.get("SSH_KEY_PASSPHRASE")
    if not passphrase:
        print("SSH_KEY_PASSPHRASE is required.", file=sys.stderr)
        sys.exit(1)
    if not LOCAL_DIR.exists():
        print(f"Missing {LOCAL_DIR}", file=sys.stderr)
        sys.exit(1)

    files = sorted(
        p for pattern in IMAGE_GLOBS for p in LOCAL_DIR.glob(pattern) if p.is_file()
    )
    log(f"Packing {len(files)} images ...")

    with tempfile.NamedTemporaryFile(suffix=".tar.gz", delete=False) as tmp:
        tar_path = Path(tmp.name)
    try:
        with tarfile.open(tar_path, mode="w:gz") as tar:
            for index, path in enumerate(files, 1):
                tar.add(path, arcname=path.name)
                if index % 500 == 0 or index == len(files):
                    log(f"  packed {index}/{len(files)}")
        size_mb = tar_path.stat().st_size / 1024 / 1024
        log(f"Archive size: {size_mb:.1f} MB")

        key = paramiko.RSAKey.from_private_key_file(str(KEY_PATH), password=passphrase)
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(HOST, username=USER, pkey=key, timeout=60)
        log(f"Connected to {HOST}")

        _, stdout, _ = client.exec_command("docker ps --format '{{.Names}}'")
        containers = [line.strip() for line in stdout.read().decode().splitlines() if line.strip()]
        container = os.environ.get("DEPLOY_CONTAINER") or "ecommerce-backend"
        if container not in containers:
            container = next(
                (n for n in containers if "backend" in n.lower() or n == "ecommerce-backend"),
                containers[0] if containers else "",
            )
        if not container:
            log("No Docker container found.")
            sys.exit(1)
        log(f"Using container: {container}")

        log("Uploading archive ...")
        sftp = client.open_sftp()

        def progress(sent: int, total: int) -> None:
            if total and sent % (10 * 1024 * 1024) < 65536:
                log(f"  uploaded {sent / 1024 / 1024:.0f}/{total / 1024 / 1024:.0f} MB")

        sftp.put(str(tar_path), REMOTE_TAR, callback=progress)
        sftp.close()
        log("Upload done.")

        extract_cmd = (
            f"mkdir -p /tmp/durmus-product-images && "
            f"tar -xzf {REMOTE_TAR} -C /tmp/durmus-product-images && "
            f"docker exec {container} mkdir -p /app/uploads/products && "
            f"docker cp /tmp/durmus-product-images/. {container}:/app/uploads/products/"
        )
        _, stdout, stderr = client.exec_command(extract_cmd, timeout=300)
        if stdout.channel.recv_exit_status() != 0:
            log(stderr.read().decode())
            sys.exit(1)

        count_cmd = f"docker exec {container} sh -c 'ls -1 /app/uploads/products | wc -l'"
        _, stdout, _ = client.exec_command(count_cmd)
        log(f"Files in container: {stdout.read().decode().strip()}")

        verify_cmd = (
            f"docker exec {container} ls -la "
            "/app/uploads/products/DRC-23897.jpg "
            "/app/uploads/products/CMP-COPELAND-ZH21K4E.png 2>&1"
        )
        _, stdout, _ = client.exec_command(verify_cmd)
        log("Verified:\n" + stdout.read().decode())
        client.close()
        log("Deploy complete.")
    finally:
        tar_path.unlink(missing_ok=True)


if __name__ == "__main__":
    main()
