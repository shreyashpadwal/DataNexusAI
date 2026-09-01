"""
test_module5.py -- Module 5 full regression test suite.
Tests ALL modules + Module 5 additions (stats, request_id, logging, security).
Run from: backend/
Usage: venv/Scripts/python.exe -X utf8 test_module5.py
"""
import sys, io, json, time, urllib.request, urllib.error, os, socket
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

BACKEND  = "http://localhost:8000"
FRONTEND = "http://localhost:5173"
SEP = "-" * 60
results = []

def get(url, timeout=10):
    try:
        with urllib.request.urlopen(url, timeout=timeout) as r:
            body = r.read()
            ct   = r.headers.get("Content-Type", "")
            hdrs = dict(r.headers)
            try:    return r.status, json.loads(body), ct, hdrs
            except: return r.status, body.decode(errors="replace"), ct, hdrs
    except urllib.error.HTTPError as e:
        return e.code, {}, "", {}
    except Exception as ex:
        return 0, str(ex), "", {}

def post_json(url, data, timeout=120):
    body = json.dumps(data).encode()
    req  = urllib.request.Request(url, data=body,
           headers={"Content-Type": "application/json"}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            hdrs = dict(r.headers)
            return r.status, json.loads(r.read()), hdrs
    except urllib.error.HTTPError as e:
        return e.code, {}, {}
    except Exception as ex:
        return 0, {"_error": str(ex)}, {}

def upload_csv(filepath, instructions="Clean and load."):
    boundary = "RegTestBoundary"
    with open(filepath, "rb") as f: file_data = f.read()
    body = (
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"instructions\"\r\n\r\n"
        f"{instructions}\r\n"
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; "
        f"filename=\"{os.path.basename(filepath)}\"\r\nContent-Type: text/csv\r\n\r\n"
    ).encode() + file_data + f"\r\n--{boundary}--\r\n".encode()
    req = urllib.request.Request(
        f"{BACKEND}/api/etl/upload", data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return r.status, json.loads(r.read()), dict(r.headers)
    except urllib.error.HTTPError as e:
        return e.code, {}, {}
    except Exception as ex:
        return 0, {"_error": str(ex)}, {}

def cors_preflight_check(origin="http://localhost:5173"):
    """Send a raw OPTIONS preflight to properly test CORS headers."""
    try:
        sock = socket.create_connection(("127.0.0.1", 8000), timeout=5)
        req  = (
            f"OPTIONS /api/health HTTP/1.1\r\n"
            f"Host: localhost:8000\r\n"
            f"Origin: {origin}\r\n"
            f"Access-Control-Request-Method: GET\r\n"
            f"Connection: close\r\n\r\n"
        )
        sock.sendall(req.encode())
        raw = sock.recv(4096).decode(errors="replace")
        sock.close()
        return "Access-Control-Allow-Origin" in raw
    except Exception:
        return False

def check(label, passed, detail=""):
    print(f"\n{SEP}")
    print(f"TEST : {label}")
    if detail: print(f"  {detail}")
    print(f"  >> {'[PASS]' if passed else '[FAIL]'}")
    results.append(passed)

print("=" * 60)
print("DataNexus AI -- Module 5 Full Regression")
print("=" * 60)

# ─── MODULE 1 REGRESSION ─────────────────────────────────────────
print("\n[MODULE 1 — Database & Health]")

s, d, _, _ = get(f"{BACKEND}/api/health")
check("M1-T1: Health endpoint returns ok",
      s == 200 and d.get("status") == "ok",
      f"status={d.get('status')}, db={d.get('database')}, version={d.get('version')}")

s, d, _, _ = get(f"{BACKEND}/api/database/stats")
check("M1-T2: Database stats — tables have data",
      s == 200 and d.get("total_rides", 0) > 0,
      f"rides={d.get('total_rides')}, users={d.get('total_users')}, revenue={d.get('total_revenue')}")

# ─── MODULE 2 REGRESSION ─────────────────────────────────────────
print("\n[MODULE 2 — SQL Agent]")

time.sleep(1)
s, d, h = post_json(f"{BACKEND}/api/chat", {"message": "What is the total revenue?"})
check("M2-T1: Chat endpoint — SQL query works",
      s == 200 and d.get("success") is True and d.get("agent") == "sql",
      f"agent={d.get('agent')}, answer={str(d.get('answer',''))[:60]}")

check("M2-T2: Generated SQL in response",
      bool(d.get("sql")),
      f"sql={str(d.get('sql',''))[:60]}")

check("M2-T3: Data rows returned",
      d.get("data") is not None and len(d.get("data",[])) > 0,
      f"rows={len(d.get('data',[]))}")

check("M2-T4: Steps trace present",
      isinstance(d.get("steps"), list) and len(d.get("steps",[])) > 0,
      f"steps={d.get('steps')}")

time.sleep(2)
s2, d2, _ = post_json(f"{BACKEND}/api/chat", {"message": "DROP TABLE users"})
check("M2-T5: DROP TABLE still blocked",
      d2.get("success") is False,
      f"success={d2.get('success')}, agent={d2.get('agent')}")

time.sleep(2)
s3, d3, _ = post_json(f"{BACKEND}/api/chat", {"message": "SELECT 1; DROP TABLE users"})
check("M2-T6: Multi-statement attack blocked",
      d3.get("success") is False,
      f"success={d3.get('success')}")

# ─── MODULE 3 REGRESSION ─────────────────────────────────────────
print("\n[MODULE 3 — ETL Agent]")

time.sleep(1)
csv_path = os.path.join(os.path.dirname(__file__), "test_data", "sample_rides.csv")
s4, d4, _ = upload_csv(csv_path, "Remove duplicates and handle missing values.")
check("M3-T1: CSV upload works",
      s4 == 200 and d4.get("success") is True,
      f"rows_loaded={d4.get('rows_loaded')}, dups={d4.get('duplicates_removed')}")

check("M3-T2: ETL operations performed",
      len(d4.get("operations_performed",[])) > 0,
      f"ops={d4.get('operations_performed')}")

# Invalid file type
boundary = "RegBoundary2"
bad_body = (
    f"--{boundary}\r\nContent-Disposition: form-data; name=\"instructions\"\r\n\r\ntest\r\n"
    f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; "
    f"filename=\"bad.xlsx\"\r\nContent-Type: application/vnd.ms-excel\r\n\r\nbad"
    f"\r\n--{boundary}--\r\n"
).encode()
req = urllib.request.Request(f"{BACKEND}/api/etl/upload", data=bad_body,
      headers={"Content-Type": f"multipart/form-data; boundary={boundary}"}, method="POST")
try:
    with urllib.request.urlopen(req, timeout=30) as r:
        r5, d5 = r.status, json.loads(r.read())
except urllib.error.HTTPError as e:
    r5, d5 = e.code, {}
check("M3-T3: Invalid file type (.xlsx) rejected",
      d5.get("success") is False and "Unsupported" in str(d5.get("error","")),
      f"error={str(d5.get('error',''))[:80]}")

# ─── MODULE 4 REGRESSION ─────────────────────────────────────────
print("\n[MODULE 4 — Frontend]")

s6, b6, ct6, _ = get(FRONTEND, timeout=5)
check("M4-T1: Frontend serves HTML",
      s6 == 200 and "html" in ct6.lower(),
      f"HTTP {s6}, content-type={ct6[:40]}")

cors_req = urllib.request.Request(
    f"{BACKEND}/api/health",
    headers={"Origin": "http://localhost:5173"}
)
try:
    with urllib.request.urlopen(cors_req, timeout=10) as r:
        cors_header = r.headers.get("Access-Control-Allow-Origin", "")
except Exception:
    cors_header = ""
check("M4-T2: CORS allows Vite origin (GET with Origin header)",
      bool(cors_header),
      f"Access-Control-Allow-Origin: {cors_header!r}")

# ─── MODULE 5 — NEW FEATURES ─────────────────────────────────────
print("\n[MODULE 5 — Observability & Stats]")

# Stats endpoint
s8, d8, _, _ = get(f"{BACKEND}/api/stats")
check("M5-T1: GET /api/stats returns data",
      s8 == 200
      and d8.get("total_users", 0) > 0
      and d8.get("total_rides", 0) > 0
      and d8.get("total_revenue", 0) > 0,
      f"users={d8.get('total_users')}, rides={d8.get('total_rides')}, revenue={d8.get('total_revenue')}")

check("M5-T2: Stats has all expected fields",
      all(k in d8 for k in ["total_users","total_vehicles","total_rides",
                              "total_payments","total_ratings","total_revenue",
                              "average_rating","etl_rows_loaded","version"]),
      f"version={d8.get('version')}, avg_rating={d8.get('average_rating')}")

check("M5-T3: Stats version field = 1.0.0",
      d8.get("version") == "1.0.0",
      f"version={d8.get('version')}")

# Request-ID in response body + headers
time.sleep(1)
s9, d9, h9 = post_json(f"{BACKEND}/api/chat", {"message": "How many users are there?"})
check("M5-T4: Chat response body includes request_id",
      bool(d9.get("request_id")),
      f"request_id={d9.get('request_id')}")

h9_lower = {k.lower(): v for k, v in h9.items()}
check("M5-T5: X-Request-ID response header present",
      "x-request-id" in h9_lower,
      f"x-request-id={h9_lower.get('x-request-id','MISSING')}")

check("M5-T6: Chat response includes duration_ms > 0",
      d9.get("duration_ms") is not None and float(d9.get("duration_ms", 0)) > 0,
      f"duration_ms={d9.get('duration_ms')}")

check("M5-T7: X-Duration-Ms header present",
      "x-duration-ms" in h9_lower,
      f"x-duration-ms={h9_lower.get('x-duration-ms','MISSING')}")

# ETL request_id
time.sleep(2)
s10, d10, h10 = upload_csv(csv_path, "Clean this file.")
check("M5-T8: ETL response body includes request_id",
      bool(d10.get("request_id")),
      f"request_id={d10.get('request_id')}")

check("M5-T9: ETL response includes duration_ms > 0",
      d10.get("duration_ms") is not None and float(d10.get("duration_ms", 0)) > 0,
      f"duration_ms={d10.get('duration_ms')}")

# Health includes version
s11, d11, _, _ = get(f"{BACKEND}/api/health")
check("M5-T10: Health endpoint includes version",
      bool(d11.get("version")),
      f"version={d11.get('version')}")

# ─── SECURITY CHECK ──────────────────────────────────────────────
print("\n[SECURITY REGRESSION]")

# Scan app code for actual (non-comment) use of exec/eval/os.system
dangerous = []
app_dir = os.path.join(os.path.dirname(__file__), "app")
DANGEROUS_PATTERNS = ["exec(", "eval(", "os.system("]
for root, dirs, files in os.walk(app_dir):
    dirs[:] = [d for d in dirs if d != "__pycache__"]
    for fn in files:
        if not fn.endswith(".py"): continue
        path = os.path.join(root, fn)
        with open(path, encoding="utf-8", errors="replace") as f:
            for i, line in enumerate(f, 1):
                stripped = line.strip()
                # Skip comment lines and docstring lines
                if stripped.startswith("#"): continue
                if stripped.startswith('"') or stripped.startswith("'"): continue
                if stripped.startswith("- No"): continue
                for pat in DANGEROUS_PATTERNS:
                    if pat in stripped:
                        dangerous.append(f"{fn}:{i} — {stripped[:80]}")

check("SEC-T1: No exec()/eval()/os.system() in non-comment application code",
      len(dangerous) == 0,
      f"Found: {dangerous}" if dangerous else "None found — secure")

# Verify .env.example exists
has_env_example = os.path.exists(os.path.join(os.path.dirname(__file__), ".env.example"))
check("SEC-T2: .env.example exists",
      has_env_example, f"exists={has_env_example}")

# Verify .env is NOT included in .env.example content (no real keys)
example_path = os.path.join(os.path.dirname(__file__), ".env.example")
if has_env_example:
    with open(example_path) as ef: example_content = ef.read()
    # Real groq keys start with gsk_ followed by many chars
    import re
    has_real_key = bool(re.search(r"gsk_[A-Za-z0-9]{20,}", example_content))
    check("SEC-T3: .env.example has no real API keys",
          not has_real_key,
          f"Real key found: {has_real_key}")
else:
    check("SEC-T3: .env.example has no real API keys", True, "File not found")

# Summary
print(f"\n{'='*60}")
total  = len(results)
passed = sum(results)
print(f"RESULTS: {passed}/{total} tests passed")
if passed == total:
    print("ALL TESTS PASS — DataNexus AI Module 5 complete.")
else:
    failed = [i+1 for i,r in enumerate(results) if not r]
    print(f"Failed test indices: {failed}")
print("="*60)
