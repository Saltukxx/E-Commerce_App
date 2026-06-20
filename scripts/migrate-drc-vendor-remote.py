"""Run DRC vendor migration on production API container."""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

import paramiko

HOST = os.environ.get("DEPLOY_HOST", "167.172.168.81")
USER = os.environ.get("DEPLOY_USER", "root")
KEY_PATH = Path(os.path.expanduser("~")) / ".ssh" / "id_rsa"
CONTAINER = os.environ.get("API_CONTAINER", "ecommerce-backend")
REPO = Path(__file__).resolve().parent.parent

MIGRATE_JS = (REPO / "backend" / "scripts" / "migrate-to-drc-vendor.ts").read_text(encoding="utf-8")
# Strip TS-only imports/exports for plain node in container
MIGRATE_JS = MIGRATE_JS.replace("import 'dotenv/config';\n", "")
MIGRATE_JS = MIGRATE_JS.replace("import * as bcrypt from 'bcrypt';\n", "const bcrypt = require('bcrypt');\n")
MIGRATE_JS = MIGRATE_JS.replace("import { PrismaClient } from '@prisma/client';\n", "const { PrismaClient } = require('@prisma/client');\n")
MIGRATE_JS = MIGRATE_JS.replace("export const OFFICIAL_STORE_SLUG", "const OFFICIAL_STORE_SLUG")
MIGRATE_JS = MIGRATE_JS.replace("export const OFFICIAL_STORE_NAME", "const OFFICIAL_STORE_NAME")
MIGRATE_JS = MIGRATE_JS.replace("export const LEGACY_STORE_SLUG", "const LEGACY_STORE_SLUG")
MIGRATE_JS = MIGRATE_JS.replace("export const VENDOR_EMAIL", "const VENDOR_EMAIL")
MIGRATE_JS = MIGRATE_JS.replace("export const VENDOR_PASSWORD", "const VENDOR_PASSWORD")


def main() -> None:
    passphrase = os.environ.get("SSH_KEY_PASSPHRASE")
    if not passphrase:
        print("SSH_KEY_PASSPHRASE is required.", file=sys.stderr)
        sys.exit(1)

    key = paramiko.RSAKey.from_private_key_file(str(KEY_PATH), password=passphrase)
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, username=USER, pkey=key, timeout=60)

    remote_js = "/tmp/migrate-to-drc-vendor.js"
    sftp = client.open_sftp()
    with sftp.open(remote_js, "w") as f:
        f.write(MIGRATE_JS)
    sftp.close()

    steps = [
        f"docker cp {remote_js} {CONTAINER}:/app/migrate-to-drc-vendor.js",
        f"docker exec -w /app {CONTAINER} node migrate-to-drc-vendor.js",
        (
            "curl -sf -X POST http://127.0.0.1/api/v1/auth/login "
            "-H 'Content-Type: application/json' "
            f"-d '{json.dumps({'email': 'vendor@drc-kaltetechnik.de', 'password': 'vendor123'})}'"
        ),
        "curl -sf http://127.0.0.1/api/v1/stores/drc-kaltetechnik | head -c 400",
    ]

    for cmd in steps:
        print(f"> {cmd[:100]}", flush=True)
        _, stdout, stderr = client.exec_command(cmd, timeout=300)
        out = stdout.read().decode("utf-8", errors="replace")
        err = stderr.read().decode("utf-8", errors="replace")
        code = stdout.channel.recv_exit_status()
        if out.strip():
            print(out.strip())
        if err.strip():
            print(err.strip(), file=sys.stderr)
        if code != 0:
            client.close()
            sys.exit(code)

    client.close()
    print("\nVendor: vendor@drc-kaltetechnik.de / vendor123", flush=True)
    print("Store:  http://167.172.168.81/api/v1/stores/drc-kaltetechnik", flush=True)


if __name__ == "__main__":
    main()
