"""
╔══════════════════════════════════════════════════════════════╗
║        LLaVA GPU Runner — GTX 1650 Full Potential           ║
║   llava.gguf + llava.mmproj via llama.cpp server (8080)     ║
╚══════════════════════════════════════════════════════════════╝

Usage:
  python llava_gpu_runner.py                    → interactive mode
  python llava_gpu_runner.py --image foo.jpg    → analyse an image
  python llava_gpu_runner.py --benchmark        → run performance benchmark
  python llava_gpu_runner.py --gpu-info         → show GPU / VRAM stats only
"""

import os
import sys
import time
import json
import base64
import argparse
import subprocess
import threading
import textwrap
import urllib.request
import urllib.error
from pathlib import Path

# ─── Config ──────────────────────────────────────────────────────────────────
SERVER_URL   = "http://127.0.0.1:8080"
MAX_TOKENS   = 1024          # Increase for longer answers
TEMPERATURE  = 0.1           # Low = more deterministic
TOP_P        = 0.95
TOP_K        = 40
REPEAT_PENALTY = 1.1
MODEL_ALIAS  = "llava-v1.5-7b"

# Colour codes (Windows 10+ supports ANSI)
try:
    import ctypes
    kernel32 = ctypes.windll.kernel32
    kernel32.SetConsoleMode(kernel32.GetStdHandle(-11), 7)
except Exception:
    pass

R  = "\033[91m"
G  = "\033[92m"
Y  = "\033[93m"
B  = "\033[94m"
M  = "\033[95m"
C  = "\033[96m"
W  = "\033[97m"
DIM= "\033[2m"
RESET = "\033[0m"
BOLD  = "\033[1m"

# ─── Helpers ─────────────────────────────────────────────────────────────────

def banner():
    print(f"""
{B}╔══════════════════════════════════════════════════════════════╗{RESET}
{B}║{RESET}  {BOLD}{C}LLaVA GPU Runner{RESET}  ·  GTX 1650 4 GB  ·  CUDA 11.7.1        {B}║{RESET}
{B}║{RESET}  {DIM}llava.gguf (7B) + llava.mmproj (CLIP) · llama.cpp b3600{RESET}   {B}║{RESET}
{B}╚══════════════════════════════════════════════════════════════╝{RESET}
""")


def hr(char="─", width=62, color=DIM):
    print(f"{color}{char * width}{RESET}")


def ok(msg):   print(f"  {G}✔{RESET}  {msg}")
def warn(msg): print(f"  {Y}⚠{RESET}  {msg}")
def err(msg):  print(f"  {R}✘{RESET}  {msg}")
def info(msg): print(f"  {C}ℹ{RESET}  {msg}")


def fmt_bytes(n):
    if n >= 1 << 30: return f"{n/(1<<30):.2f} GB"
    if n >= 1 << 20: return f"{n/(1<<20):.1f} MB"
    return f"{n} B"


# ─── GPU Monitoring ──────────────────────────────────────────────────────────

def nvidia_smi_query(fields):
    """Return dict of nvidia-smi values for GPU 0."""
    try:
        query = ",".join(fields)
        out = subprocess.check_output(
            ["nvidia-smi", f"--query-gpu={query}",
             "--format=csv,noheader,nounits", "--id=0"],
            stderr=subprocess.DEVNULL, text=True, timeout=5
        ).strip()
        values = [v.strip() for v in out.split(",")]
        return dict(zip(fields, values))
    except Exception:
        return {}


def print_gpu_stats(label="Current GPU State"):
    fields = [
        "name", "driver_version", "memory.total", "memory.used", "memory.free",
        "utilization.gpu", "utilization.memory", "temperature.gpu",
        "power.draw", "power.limit", "clocks.current.graphics", "clocks.max.graphics"
    ]
    d = nvidia_smi_query(fields)
    if not d:
        warn("nvidia-smi not reachable — cannot read GPU stats")
        return

    used   = int(d.get("memory.used", 0))
    total  = int(d.get("memory.total", 1))
    free   = int(d.get("memory.free", 0))
    pct    = used / total * 100
    bar_w  = 30
    filled = int(bar_w * pct / 100)
    bar    = f"{G}{'█' * filled}{DIM}{'░' * (bar_w - filled)}{RESET}"

    print(f"\n{BOLD}{W}  ── {label} ──{RESET}")
    print(f"  {DIM}GPU   {RESET} {G}{d.get('name','?')}{RESET}")
    print(f"  {DIM}Driver{RESET} {d.get('driver_version','?')}   "
          f"{DIM}CUDA{RESET} 11.7.1   "
          f"{DIM}Temp{RESET} {Y}{d.get('temperature.gpu','?')}°C{RESET}   "
          f"{DIM}Power{RESET} {d.get('power.draw','?')} / {d.get('power.limit','?')} W")
    print(f"  {DIM}Clock {RESET} {d.get('clocks.current.graphics','?')} MHz "
          f"(max {d.get('clocks.max.graphics','?')} MHz)")
    print(f"  {DIM}VRAM  {RESET} [{bar}] {pct:.1f}%  "
          f"{used} / {total} MB  ({free} MB free)")
    print(f"  {DIM}GPU Util {RESET} {Y}{d.get('utilization.gpu','?')}%{RESET}   "
          f"{DIM}Mem BW Util{RESET} {d.get('utilization.memory','?')}%")


class LiveGPUMonitor:
    """Polls nvidia-smi every N seconds in a background thread."""
    def __init__(self, interval=2.0):
        self.interval = interval
        self._stop = threading.Event()
        self._thread = threading.Thread(target=self._run, daemon=True)
        self.peak_util = 0
        self.peak_vram = 0
        self.samples = []

    def start(self):
        self._thread.start()

    def stop(self):
        self._stop.set()
        self._thread.join(timeout=3)

    def _run(self):
        while not self._stop.is_set():
            d = nvidia_smi_query(["utilization.gpu", "memory.used", "temperature.gpu"])
            if d:
                util = int(d.get("utilization.gpu", 0) or 0)
                vram = int(d.get("memory.used",     0) or 0)
                temp = int(d.get("temperature.gpu", 0) or 0)
                self.samples.append({"util": util, "vram": vram, "temp": temp})
                self.peak_util = max(self.peak_util, util)
                self.peak_vram = max(self.peak_vram, vram)
            self._stop.wait(self.interval)

    def report(self):
        if not self.samples:
            return
        avg_util = sum(s["util"] for s in self.samples) / len(self.samples)
        avg_vram = sum(s["vram"] for s in self.samples) / len(self.samples)
        avg_temp = sum(s["temp"] for s in self.samples) / len(self.samples)
        print(f"\n{BOLD}{C}  ── GPU Stats During Inference ──{RESET}")
        print(f"  Peak GPU Util  : {Y}{self.peak_util}%{RESET}")
        print(f"  Avg  GPU Util  : {Y}{avg_util:.1f}%{RESET}")
        print(f"  Peak VRAM Used : {Y}{self.peak_vram} MB{RESET}")
        print(f"  Avg  VRAM Used : {Y}{avg_vram:.1f} MB{RESET}")
        print(f"  Avg  Temp      : {Y}{avg_temp:.1f}°C{RESET}")
        if self.peak_util > 40:
            ok(f"GPU was actively computing  ({self.peak_util}% peak util) → {G}GPU mode confirmed{RESET}")
        elif self.peak_util > 5:
            warn(f"GPU partially used ({self.peak_util}% peak) — mix of GPU + CPU layers")
        else:
            warn("GPU util stayed near 0% — inference may be CPU-only")


# ─── Server Health ────────────────────────────────────────────────────────────

def check_server(silent=False):
    try:
        req = urllib.request.Request(f"{SERVER_URL}/health", method="GET")
        with urllib.request.urlopen(req, timeout=4) as r:
            data = json.loads(r.read().decode())
            status = data.get("status", "ok")
            if not silent:
                ok(f"Server ONLINE  —  status: {G}{status}{RESET}")
            return True
    except Exception as e:
        if not silent:
            err(f"Server OFFLINE — {e}")
            print(f"\n  {Y}→ Run {W}start-llava-server.bat{RESET}{Y} first, then re-run this script.{RESET}\n")
        return False


def check_model_info():
    """Hit /props to get server model info."""
    try:
        req = urllib.request.Request(f"{SERVER_URL}/props", method="GET")
        with urllib.request.urlopen(req, timeout=4) as r:
            data = json.loads(r.read().decode())
            return data
    except Exception:
        return {}


# ─── Inference ────────────────────────────────────────────────────────────────

def encode_image(path: Path) -> str:
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode()


def infer(prompt: str, image_path: Path = None, stream: bool = True,
          max_tokens: int = MAX_TOKENS) -> dict:
    """
    Send prompt (+optional image) to the llama.cpp server.
    Returns dict with keys: text, prompt_tokens, completion_tokens, elapsed_s
    """
    content = []
    if image_path:
        b64 = encode_image(image_path)
        mime = "image/jpeg" if image_path.suffix.lower() in (".jpg", ".jpeg") else "image/png"
        content.append({"type": "image_url",
                         "image_url": {"url": f"data:{mime};base64,{b64}"}})
    content.append({"type": "text", "text": prompt})

    payload = {
        "model": MODEL_ALIAS,
        "messages": [{"role": "user", "content": content}],
        "max_tokens":      max_tokens,
        "temperature":     TEMPERATURE,
        "top_p":           TOP_P,
        "top_k":           TOP_K,
        "repeat_penalty":  REPEAT_PENALTY,
        "stream":          stream,
    }

    body = json.dumps(payload).encode()
    req  = urllib.request.Request(
        f"{SERVER_URL}/v1/chat/completions",
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    t0       = time.perf_counter()
    full_txt = ""
    p_tokens = 0
    c_tokens = 0

    with urllib.request.urlopen(req, timeout=300) as resp:
        if stream:
            print(f"\n{BOLD}{W}  ── Model Response (streaming) ──{RESET}\n")
            first_token_time = None

            for raw_line in resp:
                line = raw_line.decode("utf-8", errors="ignore").strip()
                if not line or not line.startswith("data:"):
                    continue
                chunk = line[5:].strip()
                if chunk == "[DONE]":
                    break
                try:
                    obj = json.loads(chunk)
                except json.JSONDecodeError:
                    continue

                delta = obj.get("choices", [{}])[0].get("delta", {})
                token_text = delta.get("content", "")

                if token_text:
                    if first_token_time is None:
                        first_token_time = time.perf_counter() - t0
                    print(token_text, end="", flush=True)
                    full_txt += token_text

                # Some llama.cpp builds put usage in last chunk
                usage = obj.get("usage", {})
                if usage:
                    p_tokens = usage.get("prompt_tokens", p_tokens)
                    c_tokens = usage.get("completion_tokens", c_tokens)

            print()  # newline after streaming

        else:
            raw = json.loads(resp.read().decode())
            full_txt = raw["choices"][0]["message"]["content"]
            usage    = raw.get("usage", {})
            p_tokens = usage.get("prompt_tokens", 0)
            c_tokens = usage.get("completion_tokens", 0)
            print(f"\n{BOLD}{W}  ── Model Response ──{RESET}\n")
            # Word wrap for readability
            for para in full_txt.split("\n"):
                if para.strip():
                    print(textwrap.fill(para, width=70, initial_indent="  ",
                                        subsequent_indent="  "))
                else:
                    print()

    elapsed = time.perf_counter() - t0
    return {
        "text":              full_txt,
        "prompt_tokens":     p_tokens,
        "completion_tokens": c_tokens,
        "elapsed_s":         elapsed,
    }


def print_perf(r: dict):
    e  = r["elapsed_s"]
    ct = r["completion_tokens"]
    pt = r["prompt_tokens"]
    tps = ct / e if (e > 0 and ct > 0) else 0

    hr()
    print(f"  {DIM}Elapsed        {RESET}{W}{e:.2f}s{RESET}")
    print(f"  {DIM}Prompt tokens  {RESET}{pt}")
    print(f"  {DIM}Output tokens  {RESET}{ct}")
    print(f"  {DIM}Throughput     {RESET}{Y}{tps:.2f} tokens/sec{RESET}", end="")
    if tps >= 8:
        print(f"  ← {G}Excellent (full GPU){RESET}")
    elif tps >= 3:
        print(f"  ← {Y}Good (partial GPU offload){RESET}")
    elif tps >= 1:
        print(f"  ← {Y}Moderate (CPU bottleneck likely){RESET}")
    else:
        print(f"  ← {R}Slow — check --n-gpu-layers in bat file{RESET}")


# ─── Modes ───────────────────────────────────────────────────────────────────

def mode_gpu_info():
    banner()
    hr()
    print_gpu_stats("Live GPU State")
    hr()

    # Show VRAM budget for the model
    d = nvidia_smi_query(["memory.total", "memory.used", "memory.free"])
    total = int(d.get("memory.total", 4096))
    used  = int(d.get("memory.used",  0))
    free  = int(d.get("memory.free",  total))

    print(f"\n{BOLD}{C}  ── VRAM Budget for llava.gguf (from run logs) ──{RESET}")
    rows = [
        ("CLIP projector (mmproj)", 996, G),
        ("LLM model layers ×30",   974, G),
        ("KV cache (CUDA0)",         40, G),
        ("Compute buffer",          728, G),
        ("CPU fallback layers ×2", 3401, Y),   # these are in RAM, not VRAM
    ]
    vram_used_by_model = 996 + 974 + 40 + 728  # ≈ 2738 MB
    for name, mb, color in rows:
        bar_w = 20
        filled = int(bar_w * mb / total)
        bar = f"{color}{'█' * filled}{DIM}{'░' * (bar_w - filled)}{RESET}"
        on = "VRAM" if color == G else " RAM"
        print(f"  [{bar}] {mb:>5} MB  {DIM}({on}){RESET}  {name}")

    print(f"\n  Total VRAM used by model : {Y}~{vram_used_by_model} MB / {total} MB "
          f"({vram_used_by_model/total*100:.0f}%){RESET}")
    print(f"  Remaining VRAM free     : {G}~{total - vram_used_by_model} MB{RESET}")

    print(f"""
{BOLD}{C}  ── Optimization Tips for GTX 1650 (4 GB) ──{RESET}
  {G}✔{RESET}  --n-gpu-layers 30  is correct for llava.gguf (7B Q4_0)
  {G}✔{RESET}  --mmproj loads CLIP entirely on CUDA (996 MB)
  {Y}⚠{RESET}  Layers 31-32 fall back to CPU (expected with 4 GB)
  {C}ℹ{RESET}  Try --n-gpu-layers 32 to push all layers to GPU
      (May OOM — watch nvidia-smi while starting)
  {C}ℹ{RESET}  --ctx-size 1024 frees ~180 MB KV cache for more layers
  {C}ℹ{RESET}  Set --batch-size 512 for faster prompt processing
""")


def mode_image(image_path: Path, prompt: str):
    banner()
    hr()
    ok(f"Image  : {image_path} ({fmt_bytes(image_path.stat().st_size)})")
    ok(f"Prompt : {prompt[:80]}{'…' if len(prompt)>80 else ''}")
    hr()

    if not check_server():
        sys.exit(1)

    print_gpu_stats("GPU Before Inference")

    monitor = LiveGPUMonitor(interval=1.5)
    monitor.start()

    try:
        result = infer(prompt, image_path, stream=True)
    finally:
        monitor.stop()

    print_perf(result)
    monitor.report()
    print_gpu_stats("GPU After Inference")
    print()


def mode_text(prompt: str):
    banner()
    hr()
    ok(f"Prompt : {prompt[:80]}{'…' if len(prompt)>80 else ''}")
    hr()

    if not check_server():
        sys.exit(1)

    monitor = LiveGPUMonitor(interval=1.5)
    monitor.start()

    try:
        result = infer(prompt, image_path=None, stream=True)
    finally:
        monitor.stop()

    print_perf(result)
    monitor.report()
    print()


def mode_benchmark():
    """Run a multi-step benchmark to measure real GPU throughput."""
    banner()
    hr()
    print(f"{BOLD}{C}  Benchmark Mode — GTX 1650 + LLaVA 1.5 7B{RESET}")
    hr()

    if not check_server():
        sys.exit(1)

    tests = [
        ("Short text Q&A",
         "Explain what CUDA is in exactly 2 sentences.", None, 80),
        ("Long text generation",
         "Write a detailed 200-word description of how a GPU renders a frame in a video game.",
         None, 300),
        ("Vision (red square)",
         "What color and shape is the main object in this image?",
         Path("red_square.jpg"), 100),
        ("Vision (sewage)",
         "Describe in detail what you see in this image, including any environmental concerns.",
         Path("sewage.jpg"), 400),
    ]

    all_results = []
    for i, (label, prompt, img, max_t) in enumerate(tests, 1):
        if img and not img.exists():
            warn(f"Skipping '{label}' — {img} not found")
            continue

        print(f"\n{BOLD}  [{i}/{len(tests)}] {label}{RESET}")
        hr("·", 62)

        monitor = LiveGPUMonitor(interval=1.0)
        monitor.start()
        try:
            r = infer(prompt, img, stream=True, max_tokens=max_t)
        finally:
            monitor.stop()

        tps = r["completion_tokens"] / r["elapsed_s"] if r["elapsed_s"] > 0 and r["completion_tokens"] > 0 else 0
        all_results.append({
            "label": label,
            "tokens": r["completion_tokens"],
            "elapsed": r["elapsed_s"],
            "tps": tps,
            "peak_util": monitor.peak_util,
            "peak_vram": monitor.peak_vram,
        })
        monitor.report()

    # Summary table
    if all_results:
        hr("═")
        print(f"{BOLD}{W}  BENCHMARK SUMMARY{RESET}")
        hr("═")
        print(f"  {'Test':<30} {'Tokens':>7} {'Time':>8} {'tok/s':>7} {'Peak GPU':>10} {'Peak VRAM':>10}")
        hr()
        for r in all_results:
            tps_color = G if r["tps"] >= 5 else Y if r["tps"] >= 2 else R
            print(f"  {r['label']:<30} {r['tokens']:>7} {r['elapsed']:>7.1f}s "
                  f"{tps_color}{r['tps']:>6.2f}{RESET} t/s "
                  f"{r['peak_util']:>8}%  {r['peak_vram']:>8} MB")
        hr()
        avg_tps = sum(r["tps"] for r in all_results) / len(all_results)
        print(f"  {'Average throughput':<30} {'':>7} {'':>8} {Y}{avg_tps:>7.2f}{RESET} t/s")
        print()


def mode_interactive():
    """REPL loop — type prompts, optionally prefix with image path."""
    banner()
    hr()
    print(f"  {C}Interactive Mode{RESET}  — type your prompt and press Enter")
    print(f"  {DIM}Prefix prompt with an image path:  sewage.jpg: describe this{RESET}")
    print(f"  {DIM}Commands:  /gpu   /benchmark   /quit{RESET}")
    hr()

    if not check_server():
        sys.exit(1)

    print_gpu_stats()
    print()

    while True:
        try:
            user_input = input(f"{C}You » {RESET}").strip()
        except (EOFError, KeyboardInterrupt):
            print(f"\n{DIM}Goodbye.{RESET}\n")
            break

        if not user_input:
            continue

        if user_input.lower() in ("/quit", "/exit", "exit", "quit"):
            print(f"\n{DIM}Goodbye.{RESET}\n")
            break

        if user_input.lower() == "/gpu":
            print_gpu_stats()
            continue

        if user_input.lower() == "/benchmark":
            mode_benchmark()
            continue

        # Check for "image.jpg: prompt" syntax
        image_path = None
        prompt     = user_input

        if ":" in user_input:
            maybe_path, rest = user_input.split(":", 1)
            p = Path(maybe_path.strip())
            if p.exists() and p.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp", ".bmp"):
                image_path = p
                prompt     = rest.strip()
                info(f"Using image: {image_path}")

        if not prompt:
            prompt = "Describe this image in detail."

        monitor = LiveGPUMonitor(interval=1.5)
        monitor.start()
        try:
            result = infer(prompt, image_path, stream=True)
        except Exception as exc:
            err(f"Inference failed: {exc}")
            monitor.stop()
            continue
        finally:
            monitor.stop()

        print_perf(result)
        monitor.report()
        print()


# ─── Entry Point ─────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="LLaVA GPU Runner — maximises GTX 1650 for LLaVA 1.5 7B",
        formatter_class=argparse.RawTextHelpFormatter
    )
    parser.add_argument("--image",     type=Path, help="Path to image file for vision inference")
    parser.add_argument("--prompt",    type=str,  default="Describe this image in detail.",
                        help="Text prompt (default: 'Describe this image in detail.')")
    parser.add_argument("--benchmark", action="store_true", help="Run full benchmark suite")
    parser.add_argument("--gpu-info",  action="store_true", help="Show GPU stats and VRAM budget")
    parser.add_argument("--max-tokens",type=int,  default=MAX_TOKENS,
                        help=f"Max tokens in response (default: {MAX_TOKENS})")
    args = parser.parse_args()

    # Change working dir to script location so relative image paths work
    os.chdir(Path(__file__).parent)

    if args.gpu_info:
        mode_gpu_info()
    elif args.benchmark:
        mode_benchmark()
    elif args.image:
        if not args.image.exists():
            err(f"Image not found: {args.image}")
            sys.exit(1)
        mode_image(args.image, args.prompt)
    else:
        mode_interactive()


if __name__ == "__main__":
    main()
