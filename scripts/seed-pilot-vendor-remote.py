"""Run pilot vendor seed on production API container."""

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

SEED_JS = r"""
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  const durmusbaba = await prisma.store.findUnique({ where: { slug: 'durmusbaba' } });
  if (!durmusbaba) throw new Error('Durmusbaba store missing — run base seed first.');

  const vendorEmail = 'vendor@coolair.de';
  const passwordHash = await bcrypt.hash('vendor123', 10);

  const vendorUser = await prisma.user.upsert({
    where: { email: vendorEmail },
    update: { role: 'vendor', passwordHash },
    create: {
      email: vendorEmail,
      passwordHash,
      name: 'CoolAir Vendor',
      role: 'vendor',
    },
  });

  const store = await prisma.store.upsert({
    where: { slug: 'coolair-gmbh' },
    update: { status: 'active', ownerUserId: vendorUser.id },
    create: {
      name: 'CoolAir GmbH',
      slug: 'coolair-gmbh',
      description: 'Pilot HVAC vendor for marketplace testing',
      status: 'active',
      contactEmail: vendorEmail,
      phone: '+49 40 000000',
      ownerUserId: vendorUser.id,
    },
  });

  const category =
    (await prisma.category.findFirst()) ??
    (await prisma.category.create({
      data: {
        name: 'Test Category',
        slug: 'test-category',
        image: 'https://placehold.co/400x300?text=Test',
      },
    }));

  await prisma.product.upsert({
    where: { storeId_slug: { storeId: store.id, slug: 'pilot-fan-motor' } },
    update: { title: 'Pilot Fan Motor 120W', price: 4500, status: 'active' },
    create: {
      title: 'Pilot Fan Motor 120W',
      slug: 'pilot-fan-motor',
      description: 'Pilot vendor product for marketplace E2E',
      price: 4500,
      images: [],
      categoryId: category.id,
      storeId: store.id,
      status: 'active',
    },
  });

  console.log(JSON.stringify({
    ok: true,
    store: store.slug,
    storeId: store.id,
    email: vendorEmail,
    password: 'vendor123',
  }));
  await prisma.$disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
"""


def main() -> None:
    passphrase = os.environ.get("SSH_KEY_PASSPHRASE")
    if not passphrase:
        print("SSH_KEY_PASSPHRASE is required.", file=sys.stderr)
        sys.exit(1)

    key = paramiko.RSAKey.from_private_key_file(str(KEY_PATH), password=passphrase)
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, username=USER, pkey=key, timeout=60)

    remote_js = "/tmp/seed-pilot-vendor.js"
    sftp = client.open_sftp()
    with sftp.open(remote_js, "w") as f:
        f.write(SEED_JS)
    sftp.close()

    steps = [
        f"docker cp {remote_js} {CONTAINER}:/app/seed-pilot-vendor.js",
        f"docker exec -w /app {CONTAINER} node seed-pilot-vendor.js",
        (
            "curl -sf -X POST http://127.0.0.1/api/v1/auth/login "
            "-H 'Content-Type: application/json' "
            f"-d '{json.dumps({'email': 'vendor@coolair.de', 'password': 'vendor123'})}'"
        ),
    ]

    for cmd in steps:
        print(f"> {cmd[:100]}", flush=True)
        _, stdout, stderr = client.exec_command(cmd, timeout=120)
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
    print("\nVendor login: vendor@coolair.de / vendor123 at http://167.172.168.81/anmelden", flush=True)


if __name__ == "__main__":
    main()
