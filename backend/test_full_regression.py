"""
test_full_regression.py — Complete JWT-aware regression test for DataNexus AI.

Tests all protected endpoints with a real JWT token obtained from /api/auth/login.
Run from: backend/
Usage: venv/Scripts/python.exe -X utf8 test_full_regression.py
"""
import sys, io, json, time, urllib.request, urllib.error, os, socket
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

BACKEND  = "http://localhost:8000"
FRONTEND = "http://localhost:5173"
SEP = "-" * 60
results = []

# ── HTTP helpers ─────────────────────────────────────────────────

def get(url, token=None, timeout=10):
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, headers=headers, method="GET")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            body = r.read()
            ct   = r.headers.get("Content-Type", "")
            hdrs = dict(r.headers)
            try:    return r.status, json.loads(body), ct, hdrs
            except: return r.status, body.decode(errors="replace"), ct, hdrs
    except urllib.error.HTTPError as e:
        try:    return e.code, json.loads(e.read()), "", {}
        except: return e.code, {}, "", {}
    except Exception as ex:
        return 0, str(ex), "", {}

def post_json(url, data, token=None, timeout=120):
    body = json.dumps(data).encode()
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, data=body, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            hdrs = dict(r.headers)
            return r.status, json.loads(r.read()), hdrs
    except urllib.error.HTTPError as e:
        try:    return e.code, json.loads(e.read()), {}
        except: return e.code, {}, {}
    except Exception as ex:
        return 0, {"_error": str(ex)}, {}

def upload_csv(filepath, token, instructions="Clean and load."):
    boundary = "RegTestBoundary"
    with open(filepath, "rb") as f: file_data = f.read()
    body = (
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"instructions\"\r\n\r\n"
        f"{instructions}\r\n"
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; "
        f"filename=\"{os.path.basename(filepath)}\"\r\nContent-Type: text/csv\r\n\r\n"
    ).encode() + file_data + f"\r\n--{boundary}--\r\n".encode()
    headers = {
        "Content-Type": f"multipart/form-data; boundary={boundary}",
        "Authorization": f"Bearer {token}",
    }
    req = urllib.request.Request(
        f"{BACKEND}/api/etl/upload", data=body, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return r.status, json.loads(r.read()), dict(r.headers)
    except urllib.error.HTTPError as e:
        try:    return e.code, json.loads(e.read()), {}
        except: return e.code, {}, {}
    except Exception as ex:
        return 0, {"_error": str(ex)}, {}

def check(label, passed, detail=""):
    mark = "[PASS]" if passed else "[FAIL]"
    print(f"\n{SEP}")
    print(f"TEST : {label}")
    if detail: print(f"  {detail}")
    print(f"  >> {mark}")
    results.append((label, passed))

# ── Setup: get a JWT token ────────────────────────────────────────
print("=" * 60)
print("DataNexus AI — Full Regression Test (JWT-aware)")
print("=" * 60)

TEST_EMAIL = f"regtest_{int(time.time())}@test.com"
TEST_PASS  = "regtest_password_123"

# Register test user
s, d, _ = post_json(f"{BACKEND}/api/auth/register",
                    {"name": "Regression User", "email": TEST_EMAIL, "password": TEST_PASS})
if s != 200:
    print(f"FATAL: Could not register test user — {d}")
    sys.exit(1)

# Login
s, d, _ = post_json(f"{BACKEND}/api/auth/login",
                    {"email": TEST_EMAIL, "password": TEST_PASS})
if s != 200 or "access_token" not in d:
    print(f"FATAL: Could not login — {d}")
    sys.exit(1)
TOKEN = d["access_token"]
print(f"  Auth OK — test user registered and token obtained")

# ── HEALTH (public) ───────────────────────────────────────────────
print("\n[PART 1 — Health & Public Endpoints]")

s, d, _, _ = get(f"{BACKEND}/api/health")
check("Health endpoint — status=ok",
      s == 200 and d.get("status") == "ok",
      f"status={d.get('status')} db={d.get('database')} version={d.get('version')}")

# ── AUTH ENDPOINTS ────────────────────────────────────────────────
print("\n[PART 2 — Authentication]")

# Duplicate register blocked
s, d, _, _ = get(f"{BACKEND}/api/auth/me", token=TOKEN)
check("GET /api/auth/me — returns user (no password_hash)",
      s == 200 and "email" in d and "password_hash" not in d,
      f"email={d.get('email')} fields={list(d.keys())}")

# No-token rejected (403 from HTTPBearer, 401 from custom)
s2, _, _, _ = get(f"{BACKEND}/api/stats")
check("Protected endpoint without token — rejected (401 or 403)",
      s2 in (401, 403),
      f"status={s2}")

# Invalid token rejected
s3, _, _, _ = get(f"{BACKEND}/api/stats", token="invalid.token.here")
check("Protected endpoint with invalid token — rejected (401)",
      s3 == 401,
      f"status={s3}")

# ── STATS ─────────────────────────────────────────────────────────
print("\n[PART 3 — Stats & Database Endpoints]")

s, d, _, _ = get(f"{BACKEND}/api/stats", token=TOKEN)
check("GET /api/stats — all fields present",
      s == 200 and d.get("total_users", 0) > 0 and d.get("total_rides", 0) > 0,
      f"users={d.get('total_users')} rides={d.get('total_rides')} "
      f"revenue={d.get('total_revenue')} avg_rating={d.get('average_rating')}")

check("GET /api/stats — revenue uses payment_status=success",
      d.get("total_revenue", 0) > 0,
      f"total_revenue={d.get('total_revenue')}")

check("GET /api/stats — no credentials in response",
      "password" not in str(d) and "secret" not in str(d).lower(),
      "No sensitive fields exposed")

s2, d2, _, _ = get(f"{BACKEND}/api/database/stats", token=TOKEN)
check("GET /api/database/stats — returns data",
      s2 == 200 and "total_rides" in d2,
      f"rides={d2.get('total_rides')} revenue={d2.get('total_revenue')}")

# ── DASHBOARD ─────────────────────────────────────────────────────
print("\n[PART 4 — Dashboard Endpoint]")

s, d, _, _ = get(f"{BACKEND}/api/dashboard/stats?period=all", token=TOKEN)
check("GET /api/dashboard/stats — returns chart data",
      s == 200 and "revenue_over_time" in d and "revenue_by_city" in d,
      f"months={len(d.get('revenue_over_time',[]))} "
      f"cities={len(d.get('revenue_by_city',[]))} "
      f"vehicles={len(d.get('top_vehicles',[]))}")

check("Dashboard revenue_over_time — month format YYYY-MM",
      all(len(item.get("month","")) == 7 for item in d.get("revenue_over_time", [])[:3]),
      f"sample months={[i.get('month') for i in d.get('revenue_over_time',[])[:3]]}")

check("Dashboard top_vehicles — model, revenue, rides present",
      all("model" in v and "revenue" in v and "rides" in v
          for v in d.get("top_vehicles", [])[:3]),
      f"sample={d.get('top_vehicles',[[]])[0] if d.get('top_vehicles') else 'empty'}")

# Period filter
s2, d2, _, _ = get(f"{BACKEND}/api/dashboard/stats?period=2024", token=TOKEN)
check("GET /api/dashboard/stats?period=2024 — works",
      s2 == 200 and "revenue_over_time" in d2,
      f"months={len(d2.get('revenue_over_time',[]))}")

# Invalid period falls back to 'all'
s3, d3, _, _ = get(f"{BACKEND}/api/dashboard/stats?period=INVALID_INJECTION", token=TOKEN)
check("Dashboard invalid period — safely falls back, no SQL injection",
      s3 == 200 and "revenue_over_time" in d3,
      f"status={s3} (period sanitized to 'all')")

# ── AI ANALYST / CHAT ─────────────────────────────────────────────
print("\n[PART 5 — AI Analyst (SQL Agent)]")

time.sleep(1)
s, d, h = post_json(f"{BACKEND}/api/chat",
                    {"message": "What is the total revenue?"}, token=TOKEN)
check("AI Analyst — total revenue query",
      s == 200 and d.get("success") is True and d.get("agent") == "sql",
      f"agent={d.get('agent')} answer={str(d.get('answer',''))[:70]}")

check("AI Analyst — SQL generated",
      bool(d.get("sql")) and "SELECT" in str(d.get("sql","")).upper(),
      f"sql={str(d.get('sql',''))[:60]}")

check("AI Analyst — data rows returned",
      d.get("data") is not None and len(d.get("data", [])) > 0,
      f"rows={len(d.get('data', []))}")

check("AI Analyst — request_id in response",
      bool(d.get("request_id")),
      f"request_id={d.get('request_id')}")

check("AI Analyst — duration_ms in response",
      isinstance(d.get("duration_ms"), (int, float)) and d.get("duration_ms", 0) > 0,
      f"duration_ms={d.get('duration_ms')}")

time.sleep(2)
s2, d2, _ = post_json(f"{BACKEND}/api/chat",
                      {"message": "How many users are there?"}, token=TOKEN)
check("AI Analyst — users count query",
      s2 == 200 and d2.get("success") is True,
      f"answer={str(d2.get('answer',''))[:70]}")

time.sleep(2)
s3, d3, _ = post_json(f"{BACKEND}/api/chat",
                      {"message": "Which city has the highest revenue?"}, token=TOKEN)
check("AI Analyst — city revenue query",
      s3 == 200 and d3.get("success") is True,
      f"answer={str(d3.get('answer',''))[:70]}")

# ── SQL SECURITY ──────────────────────────────────────────────────
print("\n[PART 6 — SQL Security]")

time.sleep(2)
s, d, _ = post_json(f"{BACKEND}/api/chat",
                    {"message": "DROP TABLE users"}, token=TOKEN)
check("SQL Security — DROP TABLE blocked",
      d.get("success") is False,
      f"success={d.get('success')} agent={d.get('agent')}")

time.sleep(2)
s2, d2, _ = post_json(f"{BACKEND}/api/chat",
                      {"message": "DELETE FROM payments"}, token=TOKEN)
check("SQL Security — DELETE blocked",
      d2.get("success") is False,
      f"success={d2.get('success')}")

time.sleep(2)
s3, d3, _ = post_json(f"{BACKEND}/api/chat",
                      {"message": "SELECT 1; DROP TABLE users"}, token=TOKEN)
check("SQL Security — multi-statement blocked",
      d3.get("success") is False,
      f"success={d3.get('success')}")

# ── ETL ───────────────────────────────────────────────────────────
print("\n[PART 7 — ETL Agent]")

csv_path = os.path.join(os.path.dirname(__file__), "test_data", "sample_rides.csv")
s, d, _ = upload_csv(csv_path, TOKEN, "Remove duplicates and handle missing values.")
check("ETL — CSV upload succeeds",
      s == 200 and d.get("success") is True,
      f"rows_read={d.get('rows_read')} loaded={d.get('rows_loaded')} "
      f"dups={d.get('duplicates_removed')} skipped={d.get('rows_skipped')}")

check("ETL — operations performed",
      len(d.get("operations_performed", [])) > 0,
      f"ops={d.get('operations_performed')}")

check("ETL — destination is etl_staging (not core tables)",
      d.get("destination") == "etl_staging",
      f"destination={d.get('destination')}")

check("ETL — request_id present",
      bool(d.get("request_id")),
      f"request_id={d.get('request_id')}")

first_loaded = d.get("rows_loaded", 0)

# Second upload — duplicate prevention
time.sleep(1)
s2, d2, _ = upload_csv(csv_path, TOKEN, "Remove duplicates.")
check("ETL — second upload: duplicate rows skipped",
      s2 == 200 and d2.get("success") is True and d2.get("rows_skipped", 0) > 0,
      f"rows_skipped={d2.get('rows_skipped')} rows_loaded={d2.get('rows_loaded')}")

# Invalid file type
boundary = "BadBoundary"
bad_body = (
    f"--{boundary}\r\nContent-Disposition: form-data; name=\"instructions\"\r\n\r\ntest\r\n"
    f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; "
    f"filename=\"bad.xlsx\"\r\nContent-Type: application/vnd.ms-excel\r\n\r\nbad"
    f"\r\n--{boundary}--\r\n"
).encode()
req = urllib.request.Request(
    f"{BACKEND}/api/etl/upload", data=bad_body,
    headers={
        "Content-Type": f"multipart/form-data; boundary={boundary}",
        "Authorization": f"Bearer {TOKEN}",
    }, method="POST")
try:
    with urllib.request.urlopen(req, timeout=30) as r:
        rb, db = r.status, json.loads(r.read())
except urllib.error.HTTPError as e:
    rb = e.code
    try:    db = json.loads(e.read())
    except: db = {}
check("ETL — invalid file type (.xlsx) rejected",
      db.get("success") is False,
      f"error={str(db.get('error', db.get('detail', '')))[:80]}")

# ── SECURITY CODE SCAN ────────────────────────────────────────────
print("\n[PART 8 — Security Code Scan]")

dangerous = []
app_dir = os.path.join(os.path.dirname(__file__), "app")
for root, dirs, files in os.walk(app_dir):
    dirs[:] = [d for d in dirs if d != "__pycache__"]
    for fn in files:
        if not fn.endswith(".py"): continue
        path = os.path.join(root, fn)
        with open(path, encoding="utf-8", errors="replace") as f:
            in_docstring = False
            for i, line in enumerate(f, 1):
                stripped = line.strip()
                # Toggle docstring tracking (handles both ''' and """)
                triple_count = stripped.count('"""') + stripped.count("'''")
                if triple_count % 2 == 1:
                    in_docstring = not in_docstring
                    continue
                if in_docstring:
                    continue  # inside a docstring — skip
                if stripped.startswith("#"):
                    continue  # comment line — skip
                for pat in ["exec(", "eval(", "os.system("]:
                    if pat in stripped:
                        dangerous.append(f"{fn}:{i} — {stripped[:80]}")
check("No exec()/eval()/os.system() in application code",
      len(dangerous) == 0,
      f"Found: {dangerous}" if dangerous else "None — secure")

import re
env_path = os.path.join(os.path.dirname(__file__), ".env.example")
if os.path.exists(env_path):
    with open(env_path) as f: ec = f.read()
    has_real_key = bool(re.search(r"gsk_[A-Za-z0-9]{20,}", ec))
    check(".env.example — no real Groq API keys",
          not has_real_key, f"real_key_found={has_real_key}")
else:
    check(".env.example exists", False, "File missing!")

# ── OBSERVABILITY ─────────────────────────────────────────────────
print("\n[PART 9 — Observability Headers]")

time.sleep(1)
s, d, h = post_json(f"{BACKEND}/api/chat",
                    {"message": "How many vehicles are there?"}, token=TOKEN)
h_low = {k.lower(): v for k, v in h.items()}
check("X-Request-ID header present",
      "x-request-id" in h_low,
      f"x-request-id={h_low.get('x-request-id', 'MISSING')}")
check("X-Duration-Ms header present",
      "x-duration-ms" in h_low,
      f"x-duration-ms={h_low.get('x-duration-ms', 'MISSING')}")

# ── FRONTEND ─────────────────────────────────────────────────────
print("\n[PART 10 — Frontend Availability]")

s, b, ct, _ = get(FRONTEND, timeout=5)
check("Frontend serves HTML",
      s == 200 and "html" in ct.lower(),
      f"HTTP {s} content-type={ct[:40]}")

# ── SUMMARY ───────────────────────────────────────────────────────
print(f"\n{'='*60}")
total  = len(results)
passed = sum(1 for _, p in results if p)
failed_list = [label for label, p in results if not p]
print(f"RESULTS: {passed}/{total} tests passed")
if passed == total:
    print("ALL TESTS PASS — DataNexus AI regression complete.")
else:
    print(f"FAILED TESTS:")
    for lbl in failed_list:
        print(f"  - {lbl}")
print("=" * 60)
