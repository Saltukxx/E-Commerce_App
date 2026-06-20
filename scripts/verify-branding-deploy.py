"""Verify production branding UI deploy."""

from __future__ import annotations

import os
import sys
from pathlib import Path

import paramiko

HOST = os.environ.get("DEPLOY_HOST", "167.172.168.81")
KEY_PATH = Path.home() / ".ssh" / "id_rsa"


def main() -> None:
    passphrase = os.environ.get("SSH_KEY_PASSPHRASE")
    if not passphrase:
        print("SSH_KEY_PASSPHRASE required", file=sys.stderr)
        sys.exit(1)

    key = paramiko.RSAKey.from_private_key_file(str(KEY_PATH), password=passphrase)
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, username="root", pkey=key, timeout=60)

    checks = [
        "docker ps --format '{{.Names}} {{.Status}}'",
        "curl -sf -o /dev/null -w 'home:%{http_code}' http://127.0.0.1/",
        "curl -sf -o /dev/null -w ' katalog:%{http_code}' http://127.0.0.1/katalog",
        "curl -sf -o /dev/null -w ' logo:%{http_code}' http://127.0.0.1/assets/logo-durmusbaba.png",
        "curl -sf -o /dev/null -w ' hero:%{http_code}' http://127.0.0.1/assets/hero-hvac-marktplatz.png",
        "curl -sf -o /dev/null -w ' newest:%{http_code}' 'http://127.0.0.1:3001/api/v1/products?limit=1&sort=newest'",
        "curl -sf -o /dev/null -w ' best:%{http_code}' 'http://127.0.0.1:3001/api/v1/products?limit=1&sort=bestselling'",
    ]
    for cmd in checks:
        _, stdout, stderr = client.exec_command(cmd)
        out = stdout.read().decode("utf-8", errors="replace").strip()
        err = stderr.read().decode("utf-8", errors="replace").strip()
        print(f"{cmd[:70]}...")
        print(out or err or "(empty)")
        print()

    client.close()


if __name__ == "__main__":
    main()
