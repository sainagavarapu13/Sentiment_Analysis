from __future__ import annotations

import os
import shutil
import socket
import signal
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def _start_process(command: list[str]) -> subprocess.Popen[str]:
    return subprocess.Popen(
        command,
        cwd=str(ROOT),
        env={**os.environ, "PYTHONUNBUFFERED": "1"},
        stdout=sys.stdout,
        stderr=sys.stderr,
        stdin=sys.stdin,
        text=True,
    )


def _frontend_command() -> list[str]:
    if os.name == "nt":
        npm_path = shutil.which("npm") or shutil.which("npm.cmd")
        if npm_path:
            return [npm_path, "run", "dev:frontend"]
        return ["cmd", "/c", "npm", "run", "dev:frontend"]
    return ["npm", "run", "dev:frontend"]


def _port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        return sock.connect_ex(("127.0.0.1", port)) == 0


def main() -> int:
    backend_running = _port_in_use(8000)
    frontend_running = _port_in_use(3000)

    if backend_running:
        print("Backend is already running on http://localhost:8000")
        backend = None
    else:
        backend = _start_process([
            sys.executable,
            "-m",
            "uvicorn",
            "sentiment_backend.main:app",
            "--host",
            "0.0.0.0",
            "--port",
            "8000",
        ])

    if frontend_running:
        print("Frontend is already running on http://localhost:3000")
        frontend = None
    else:
        frontend = _start_process(_frontend_command())

    print("\nBackend: http://localhost:8000/health")
    print("Frontend: http://localhost:3000")
    print("Press Ctrl+C to stop both services.\n")

    try:
        while True:
            if backend is not None and backend.poll() is not None:
                break
            if frontend is not None and frontend.poll() is not None:
                break
            import time
            time.sleep(0.5)
    except KeyboardInterrupt:
        print("\nShutting down services...\n")
    finally:
        for process in (backend, frontend):
            if process is None:
                continue
            if process.poll() is None:
                if os.name == "nt":
                    process.send_signal(signal.CTRL_BREAK_EVENT)
                else:
                    process.terminate()
                try:
                    process.wait(timeout=10)
                except subprocess.TimeoutExpired:
                    process.kill()
                    process.wait(timeout=10)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
