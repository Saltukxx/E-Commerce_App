"""Upload DRC store logo/banner and update production DB."""

from __future__ import annotations

import os
import sys
from pathlib import Path

import paramiko

HOST = os.environ.get("DEPLOY_HOST", "167.172.168.81")
USER = os.environ.get("DEPLOY_USER", "root")
KEY_PATH = Path(os.path.expanduser("~")) / ".ssh" / "id_rsa"
CONTAINER = os.environ.get("API_CONTAINER", "ecommerce-backend")
REPO = Path(__file__).resolve().parent.parent

LOGO = REPO / "backend" / "uploads" / "stores" / "drc-kaltetechnik-logo.png"
BANNER = REPO / "backend" / "uploads" / "stores" / "drc-kaltetechnik-banner.png"
LOGO_URL = "/uploads/stores/drc-kaltetechnik-logo.png"
BANNER_URL = "/uploads/stores/drc-kaltetechnik-banner.png"

UPDATE_JS = f"""
const {{ PrismaClient }} = require('@prisma/client');
(async () => {{
  const prisma = new PrismaClient();
  const store = await prisma.store.update({{
    where: {{ slug: 'drc-kaltetechnik' }},
    data: {{
      logo: '{LOGO_URL}',
      banner: '{BANNER_URL}',
    }},
  }});
  console.log(JSON.stringify({{ ok: true, logo: store.logo, banner: store.banner }}));
  await prisma.$disconnect();
}})().catch((e) => {{ console.error(e); process.exit(1); }});
"""


def main() -> None:
    passphrase = os.environ.get("SSH_KEY_PASSPHRASE")
    if not passphrase:
        print("SSH_KEY_PASSPHRASE is required.", file=sys.stderr)
        sys.exit(1)
    if not LOGO.is_file() or not BANNER.is_file():
        print("Run asset copy first — missing backend/uploads/stores/*.png", file=sys.stderr)
        sys.exit(1)

    key = paramiko.RSAKey.from_private_key_file(str(KEY_PATH), password=passphrase)
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, username=USER, pkey=key, timeout=60)

    sftp = client.open_sftp()
    for local, remote_name in (
        (LOGO, "drc-kaltetechnik-logo.png"),
        (BANNER, "drc-kaltetechnik-banner.png"),
    ):
        remote = f"/tmp/{remote_name}"
        sftp.put(str(local), remote)
        cmd = (
            f"docker exec {CONTAINER} mkdir -p /app/uploads/stores && "
            f"docker cp {remote} {CONTAINER}:/app/uploads/stores/{remote_name}"
        )
        print(f"> upload {remote_name}", flush=True)
        _, stdout, stderr = client.exec_command(cmd, timeout=120)
        code = stdout.channel.recv_exit_status()
        if code != 0:
            print(stderr.read().decode(), file=sys.stderr)
            client.close()
            sys.exit(code)
    sftp.close()

    remote_js = "/tmp/set-drc-branding.js"
    sftp = client.open_sftp()
    with sftp.open(remote_js, "w") as f:
        f.write(UPDATE_JS)
    sftp.close()

    for cmd in (
        f"docker cp {remote_js} {CONTAINER}:/app/set-drc-branding.js",
        f"docker exec -w /app {CONTAINER} node set-drc-branding.js",
        f"curl -sf -o /dev/null -w logo:%{{http_code}} http://127.0.0.1{LOGO_URL}; echo",
        f"curl -sf -o /dev/null -w banner:%{{http_code}} http://127.0.0.1{BANNER_URL}; echo",
        "curl -sf http://127.0.0.1/api/v1/stores/drc-kaltetechnik | head -c 500",
    ):
        print(f"> {cmd[:100]}", flush=True)
        _, stdout, stderr = client.exec_command(cmd, timeout=120)
        out = stdout.read().decode("utf-8", errors="replace")
        if out.strip():
            print(out.strip())
        if stdout.channel.recv_exit_status() != 0:
            err = stderr.read().decode("utf-8", errors="replace")
            if err.strip():
                print(err, file=sys.stderr)
            client.close()
            sys.exit(1)

    remote_dir = os.environ.get("DEPLOY_DIR", "/opt/durmusbaba")
    web_assets = remote_dir + "/web/public/assets"
    client.exec_command(f"mkdir -p {web_assets}", timeout=30)[1].read()
    sftp = client.open_sftp()
    for local, name in (
        (REPO / "web" / "public" / "assets" / "store_logo_drc_kaltetechnik.png", "store_logo_drc_kaltetechnik.png"),
        (REPO / "web" / "public" / "assets" / "store_banner_drc_kaltetechnik.png", "store_banner_drc_kaltetechnik.png"),
    ):
        sftp.put(str(local), f"{web_assets}/{name}")
        print(f"  synced web asset {name}", flush=True)
    sftp.close()

    compose = f"cd {remote_dir} && docker compose -f docker-compose.prod.prebuilt.yml --env-file .env"
    for cmd in (f"{compose} build web", f"{compose} up -d web"):
        print(f"> {cmd}", flush=True)
        _, stdout, _ = client.exec_command(cmd, timeout=600)
        print(stdout.read().decode("utf-8", errors="replace")[-1500:])

    client.close()
    print("\nDRC branding live on production (API + web).", flush=True)


if __name__ == "__main__":
    main()
