"""Deploy admin/vendor panel changes (backend + web) to production."""

from __future__ import annotations

import io
import os
import sys
import tarfile
import time
from pathlib import Path

import paramiko

HOST = os.environ.get("DEPLOY_HOST", "167.172.168.81")
USER = os.environ.get("DEPLOY_USER", "root")
KEY_PATH = Path(os.path.expanduser("~")) / ".ssh" / "id_rsa"
REPO = Path(__file__).resolve().parent.parent
REMOTE_DIR = os.environ.get("DEPLOY_DIR", "/opt/durmusbaba")
SKIP_PARTS = {"node_modules", ".next", "__pycache__", ".git"}
COMPOSE = "docker compose -f docker-compose.prod.server.yml --env-file .env"


def pack_repo() -> bytes:
    buf = io.BytesIO()
    with tarfile.open(fileobj=buf, mode="w:gz") as tar:
        web_dir = REPO / "web"
        for path in web_dir.rglob("*"):
            if path.is_file() and not SKIP_PARTS.intersection(path.parts):
                tar.add(path, arcname=f"web/{path.relative_to(web_dir).as_posix()}")

        for sub in ("prisma", "src"):
            base = REPO / "backend" / sub
            for path in base.rglob("*"):
                if path.is_file():
                    tar.add(path, arcname=f"backend/{sub}/{path.relative_to(base).as_posix()}")

        for rel in (
            "backend/Dockerfile",
            "backend/package.json",
            "backend/package-lock.json",
            "backend/tsconfig.json",
            "backend/tsconfig.build.json",
            "backend/nest-cli.json",
            "backend/docs/marketplace-admin.md",
            "docker-compose.prod.server.yml",
        ):
            path = REPO / rel
            if path.is_file():
                tar.add(path, arcname=rel.replace("\\", "/"))
    return buf.getvalue()


def connect_client(key: paramiko.RSAKey) -> paramiko.SSHClient:
    last_err: Exception | None = None
    for attempt in range(1, 4):
        try:
            client = paramiko.SSHClient()
            client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            client.connect(HOST, username=USER, pkey=key, timeout=90, banner_timeout=90)
            return client
        except Exception as exc:  # noqa: BLE001
            last_err = exc
            print(f"SSH attempt {attempt}/3 failed: {exc}", flush=True)
            if attempt < 3:
                time.sleep(15)
    raise last_err or RuntimeError("SSH connect failed")


def run_cmd(client: paramiko.SSHClient, cmd: str, timeout: int = 600, stream: bool = False) -> int:
    print(f"> {cmd[:140]}", flush=True)
    chan = client.get_transport().open_session()
    chan.settimeout(timeout)
    chan.exec_command(cmd)
    buf = b""
    while True:
        if chan.recv_ready():
            chunk = chan.recv(4096)
            if chunk:
                buf += chunk
                if stream:
                    print(chunk.decode("utf-8", errors="replace"), end="", flush=True)
        if chan.exit_status_ready():
            break
        time.sleep(0.3)
    code = chan.recv_exit_status()
    if not stream and buf:
        text = buf.decode("utf-8", errors="replace")
        print(text[-4000:].encode("ascii", errors="replace").decode("ascii"), flush=True)
    return code


def ensure_docker(client: paramiko.SSHClient) -> None:
    print("Ensuring Docker is running...", flush=True)
    code = run_cmd(
        client,
        "systemctl start docker 2>/dev/null; "
        "timeout 15 docker info >/dev/null 2>&1 && echo DOCKER_OK || echo DOCKER_FAIL",
        timeout=30,
    )
    if code != 0:
        print("WARNING: docker info failed", flush=True)


def main() -> None:
    passphrase = os.environ.get("SSH_KEY_PASSPHRASE")
    if not passphrase:
        print("SSH_KEY_PASSPHRASE is required.", file=sys.stderr)
        sys.exit(1)

    payload = pack_repo()
    print(f"Archive: {len(payload) / 1024 / 1024:.1f} MB", flush=True)

    key = paramiko.RSAKey.from_private_key_file(str(KEY_PATH), password=passphrase)
    client = connect_client(key)
    print(f"Connected to {HOST}", flush=True)

    ensure_docker(client)

    remote_tar = "/tmp/panels-sync.tar.gz"
    print("Uploading archive...", flush=True)
    sftp = client.open_sftp()
    with sftp.open(remote_tar, "wb") as rf:
        rf.write(payload)
    sftp.close()
    print("Upload done.", flush=True)

    steps: list[tuple[str, int, bool]] = [
        (f"mkdir -p {REMOTE_DIR} && tar -xzf {remote_tar} -C {REMOTE_DIR}", 120, False),
        (f"cd {REMOTE_DIR} && DOCKER_BUILDKIT=1 {COMPOSE} up -d --build api web nginx", 2400, True),
        (f"cd {REMOTE_DIR} && {COMPOSE} exec -T api npx prisma migrate deploy", 300, False),
    ]
    for cmd, timeout, stream in steps:
        if run_cmd(client, cmd, timeout=timeout, stream=stream) != 0:
            sys.exit(1)

    for check in (
        "curl -sf -o /dev/null -w 'home:%{http_code} ' http://127.0.0.1/",
        "curl -sf -o /dev/null -w 'admin:%{http_code} ' http://127.0.0.1/admin/dashboard",
    ):
        _, stdout, _ = client.exec_command(check, timeout=30)
        print(stdout.read().decode("utf-8", errors="replace"), end=" ", flush=True)
    print(flush=True)

    client.close()
    print("Panels deploy complete.", flush=True)


if __name__ == "__main__":
    main()
