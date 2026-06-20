"""Run DRC catalog import inside production backend container."""

from __future__ import annotations

import os
import sys
import tarfile
import io
from pathlib import Path

import paramiko

HOST = os.environ.get("DEPLOY_HOST", "167.172.168.81")
USER = os.environ.get("DEPLOY_USER", "root")
KEY_PATH = Path(os.path.expanduser("~")) / ".ssh" / "id_rsa"
BACKEND = Path(__file__).resolve().parent.parent
SERVER_URL = os.environ.get("SERVER_URL", "")


def main() -> None:
    passphrase = os.environ.get("SSH_KEY_PASSPHRASE")
    if not passphrase:
        print("SSH_KEY_PASSPHRASE is required.", file=sys.stderr)
        sys.exit(1)

    key = paramiko.RSAKey.from_private_key_file(str(KEY_PATH), password=passphrase)
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, username=USER, pkey=key, timeout=30)
    print(f"Connected to {HOST}")

    _, stdout, _ = client.exec_command("docker ps --format '{{.Names}}'")
    containers = [line.strip() for line in stdout.read().decode().splitlines() if line.strip()]
    container = next((n for n in containers if n == "ecommerce-backend"), containers[0])
    print(f"Container: {container}")

    # Pack scripts + catalog into tarball
    buf = io.BytesIO()
    with tarfile.open(fileobj=buf, mode="w:gz") as tar:
        for name in [
            "scripts/drc-catalog.json",
            "scripts/drc-utils.ts",
            "scripts/import-drc-catalog.ts",
            "scripts/resolve-store.ts",
        ]:
            path = BACKEND / name
            tar.add(path, arcname=name)
    buf.seek(0)

    sftp = client.open_sftp()
    remote_tar = "/tmp/drc-import.tgz"
    with sftp.open(remote_tar, "wb") as rf:
        rf.write(buf.read())
    sftp.close()

    cmds = [
        f"docker cp {remote_tar} {container}:/tmp/drc-import.tgz",
        f"docker exec {container} sh -c 'cd /app && tar -xzf /tmp/drc-import.tgz'",
        (
            f"docker exec -e SERVER_URL={SERVER_URL} {container} "
            f"sh -c 'cd /app && npx ts-node --transpile-only scripts/import-drc-catalog.ts'"
        ),
    ]
    for cmd in cmds:
        print(f"> {cmd[:100]}...")
        _, stdout, stderr = client.exec_command(cmd, timeout=600)
        out = stdout.read().decode()
        err = stderr.read().decode()
        code = stdout.channel.recv_exit_status()
        if out:
            print(out)
        if code != 0:
            print(err, file=sys.stderr)
            sys.exit(code)

    _, stdout, _ = client.exec_command(
        f"curl -sf '{SERVER_URL}/api/v1/products?limit=2'"
    )
    print("API sample:", stdout.read().decode()[:600])
    client.close()
    print("Done.")


if __name__ == "__main__":
    main()
