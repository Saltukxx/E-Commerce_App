"""Build api + web locally, upload artifacts, fast docker image on server."""

from __future__ import annotations

import io
import os
import subprocess
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
COMPOSE = "docker compose -f docker-compose.prod.prebuilt.yml --env-file .env"

NEXT_PUBLIC_API_URL = os.environ.get(
    "NEXT_PUBLIC_API_URL", "http://167.172.168.81/api/v1"
)
NEXT_PUBLIC_UPLOADS_BASE = os.environ.get(
    "NEXT_PUBLIC_UPLOADS_BASE", "http://167.172.168.81"
)


def run_local(cmd: list[str], cwd: Path, env: dict[str, str] | None = None) -> None:
    print(f"\n>> {' '.join(cmd)}  (cwd={cwd.name})", flush=True)
    merged = os.environ.copy()
    if env:
        merged.update(env)
    subprocess.run(cmd, cwd=cwd, env=merged, check=True, shell=os.name == "nt")


def build_backend() -> None:
    backend = REPO / "backend"
    run_local(["npm", "ci"], backend)
    run_local(["npx", "prisma", "generate"], backend)
    run_local(["npm", "run", "build"], backend)
    if not (backend / "dist" / "main.js").exists() and not list((backend / "dist").glob("main.js")):
        # nest may output dist/src/main.js
        if not list((backend / "dist").rglob("main.js")):
            raise RuntimeError("backend build failed: dist/main.js missing")


def build_web() -> None:
    web = REPO / "web"
    run_local(["npm", "ci"], web)
    run_local(
        ["npm", "run", "build"],
        web,
        env={
            "NEXT_PUBLIC_API_URL": NEXT_PUBLIC_API_URL,
            "NEXT_PUBLIC_UPLOADS_BASE": NEXT_PUBLIC_UPLOADS_BASE,
        },
    )
    standalone = web / ".next" / "standalone" / "server.js"
    if not standalone.exists():
        raise RuntimeError("web build failed: .next/standalone/server.js missing")


def pack_artifacts() -> bytes:
    buf = io.BytesIO()
    with tarfile.open(fileobj=buf, mode="w:gz") as tar:
        def add(path: Path, arcname: str, *, include_node_modules: bool = False) -> None:
            if path.is_file():
                tar.add(path, arcname=arcname)
            elif path.is_dir():
                for f in path.rglob("*"):
                    if not f.is_file():
                        continue
                    if not include_node_modules and "node_modules" in f.parts:
                        continue
                    tar.add(f, arcname=f"{arcname}/{f.relative_to(path).as_posix()}")

        add(REPO / "backend" / "dist", "backend/dist")
        add(REPO / "backend" / "prisma", "backend/prisma")
        for name in (
            "backend/package.json",
            "backend/package-lock.json",
            "backend/Dockerfile.prebuilt",
            "backend/.dockerignore.prebuilt",
            "web/Dockerfile.prebuilt",
            "docker-compose.prod.prebuilt.yml",
        ):
            p = REPO / name.replace("/", os.sep)
            if p.is_file():
                tar.add(p, arcname=name)

        add(REPO / "web" / ".next" / "standalone", "web/.next/standalone", include_node_modules=True)
        add(REPO / "web" / ".next" / "static", "web/.next/static")
        add(REPO / "web" / "public", "web/public")

        nginx = REPO / "nginx"
        if nginx.is_dir():
            add(nginx, "nginx")

    return buf.getvalue()


def verify_artifacts() -> None:
    dist_files = list((REPO / "backend" / "dist").rglob("*.js"))
    if not dist_files:
        raise RuntimeError("backend/dist is empty — run build first")
    if not (REPO / "web" / ".next" / "standalone" / "server.js").exists():
        raise RuntimeError("web/.next/standalone/server.js missing")
    print(f"Artifacts OK: {len(dist_files)} backend JS files, web standalone present.", flush=True)


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
                time.sleep(10)
    raise last_err or RuntimeError("SSH connect failed")


def run_remote(client: paramiko.SSHClient, cmd: str, timeout: int = 600, stream: bool = False) -> int:
    print(f"> {cmd[:160]}", flush=True)
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
        time.sleep(0.2)
    code = chan.recv_exit_status()
    if not stream and buf:
        text = buf.decode("utf-8", errors="replace")
        print(text[-4000:].encode("ascii", errors="replace").decode("ascii"), flush=True)
    return code


def main() -> None:
    passphrase = os.environ.get("SSH_KEY_PASSPHRASE")
    if not passphrase:
        print("SSH_KEY_PASSPHRASE is required.", file=sys.stderr)
        sys.exit(1)

    print("=== Local build: backend ===", flush=True)
    if os.environ.get("SKIP_LOCAL_BUILD") != "1":
        build_backend()
        build_web()
    else:
        print("(SKIP_LOCAL_BUILD=1 — using existing dist/ and .next/)", flush=True)

    verify_artifacts()
    payload = pack_artifacts()
    print(f"\nArchive: {len(payload) / 1024 / 1024:.1f} MB", flush=True)

    key = paramiko.RSAKey.from_private_key_file(str(KEY_PATH), password=passphrase)
    client = connect_client(key)
    print(f"Connected to {HOST}", flush=True)

    remote_tar = "/tmp/prebuilt-sync.tar.gz"
    sftp = client.open_sftp()
    with sftp.open(remote_tar, "wb") as rf:
        rf.write(payload)
    sftp.close()
    print("Upload done.", flush=True)

    steps: list[tuple[str, int, bool]] = [
        (f"mkdir -p {REMOTE_DIR} && tar -xzf {remote_tar} -C {REMOTE_DIR}", 120, False),
        (f"cp {REMOTE_DIR}/backend/.dockerignore.prebuilt {REMOTE_DIR}/backend/.dockerignore", 30, False),
        (f"cd {REMOTE_DIR} && DOCKER_BUILDKIT=1 {COMPOSE} build api web", 600, True),
        (f"cd {REMOTE_DIR} && {COMPOSE} up -d api web nginx", 120, False),
        (f"cd {REMOTE_DIR} && {COMPOSE} exec -T api npx prisma migrate deploy", 300, False),
    ]
    for cmd, timeout, stream in steps:
        if run_remote(client, cmd, timeout=timeout, stream=stream) != 0:
            client.close()
            sys.exit(1)

    for check in (
        "curl -sf -o /dev/null -w 'home:%{http_code} ' http://127.0.0.1/",
        "curl -sf -o /dev/null -w 'vendor:%{http_code} ' http://127.0.0.1/vendor/dashboard",
        "curl -sf -o /dev/null -w 'revalidate:%{http_code} ' -X POST http://127.0.0.1/api/revalidate",
    ):
        _, stdout, _ = client.exec_command(check, timeout=30)
        print(stdout.read().decode("utf-8", errors="replace"), end=" ", flush=True)
    print(flush=True)

    client.close()
    print("Local-build deploy complete.", flush=True)


if __name__ == "__main__":
    main()
