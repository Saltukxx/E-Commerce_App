import os
import paramiko
from pathlib import Path

key = paramiko.RSAKey.from_private_key_file(
    str(Path.home() / ".ssh" / "id_rsa"),
    password=os.environ["SSH_KEY_PASSPHRASE"],
)
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect("167.172.168.81", username="root", pkey=key, timeout=60)
cmds = [
    "systemctl is-active docker",
    "cd /opt/durmusbaba && docker compose -f docker-compose.prod.server.yml --env-file .env ps -a",
    "curl -sf -o /dev/null -w 'home:%{http_code}\\n' http://127.0.0.1/ || echo home:fail",
    "curl -sf -o /dev/null -w 'admin:%{http_code}\\n' http://127.0.0.1/admin/dashboard || echo admin:fail",
]
for cmd in cmds:
    print("===", cmd)
    _, out, err = c.exec_command(cmd, timeout=90)
    print(out.read().decode())
    e = err.read().decode()
    if e:
        print("ERR:", e)
c.close()
