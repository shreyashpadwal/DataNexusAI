"""
Targeted validation tests for the UX improvements.
Tests Part 1 (ETL fields) and Part 2 (ambiguous/unsafe/clear NL queries).
Run: venv\Scripts\python.exe -X utf8 test_ux_improvements.py
"""
import sys, io, json, time, urllib.request, urllib.error, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

BACKEND = "http://localhost:8000"
SEP = "-" * 60
results = []

# --- AUTH SETUP ---
test_email = f"test_ux_{int(time.time())}@example.com"
req = urllib.request.Request(f"{BACKEND}/api/auth/register", data=json.dumps({"name": "UX Test", "email": test_email, "password": "pass"}).encode(), headers={"Content-Type": "application/json"}, method="POST")
try: urllib.request.urlopen(req)
except: pass
req = urllib.request.Request(f"{BACKEND}/api/auth/login", data=json.dumps({"email": test_email, "password": "pass"}).encode(), headers={"Content-Type": "application/json"}, method="POST")
with urllib.request.urlopen(req) as r:
    TOKEN = json.loads(r.read())["access_token"]
# ------------------

def post_json(url, data, timeout=120):
    body = json.dumps(data).encode()
    req  = urllib.request.Request(url, data=body,
           headers={"Content-Type": "application/json", "Authorization": f"Bearer {TOKEN}"}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return e.code, {}
    except Exception as ex:
        return 0, {"_error": str(ex)}

def upload_csv(filepath, instructions="Remove duplicates and handle missing values."):
    boundary = "TestBoundary99"
    with open(filepath, "rb") as f: data = f.read()
    body = (
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"instructions\"\r\n\r\n"
        f"{instructions}\r\n"
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; "
        f"filename=\"{os.path.basename(filepath)}\"\r\nContent-Type: text/csv\r\n\r\n"
    ).encode() + data + f"\r\n--{boundary}--\r\n".encode()
    req = urllib.request.Request(
        f"{BACKEND}/api/etl/upload", data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}", "Authorization": f"Bearer {TOKEN}"}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return e.code, {}
    except Exception as ex:
        return 0, {"_error": str(ex)}

def check(label, passed, detail=""):
    print(f"\n{SEP}")
    print(f"TEST : {label}")
    if detail: print(f"  {detail}")
    print(f"  >> {'[PASS]' if passed else '[FAIL]'}")
    results.append((label, passed))

print("=" * 60)
print("DataNexus AI — UX Improvement Validation")
print("=" * 60)

# ── PART 1: ETL PostgreSQL confirmation fields ────────────────
print("\n[PART 1 — ETL PostgreSQL Persistence Fields]")
csv_path = os.path.join(os.path.dirname(__file__), "test_data", "sample_rides.csv")
s, d = upload_csv(csv_path)

check("ETL-1: Upload succeeds",
      s == 200 and d.get("success") is True,
      f"status={s}, success={d.get('success')}")

check("ETL-2: rows_read present and > 0",
      d.get("rows_read", 0) > 0,
      f"rows_read={d.get('rows_read')}")

check("ETL-3: rows_loaded present and > 0",
      d.get("rows_loaded", 0) > 0,
      f"rows_loaded={d.get('rows_loaded')}")

check("ETL-4: duplicates_removed present (integer)",
      isinstance(d.get("duplicates_removed"), int),
      f"duplicates_removed={d.get('duplicates_removed')}")

check("ETL-5: missing_values_handled present (integer)",
      isinstance(d.get("missing_values_handled"), int),
      f"missing_values_handled={d.get('missing_values_handled')}")

check("ETL-6: destination field present",
      bool(d.get("destination")),
      f"destination={d.get('destination')}")

check("ETL-7: operations_performed is non-empty list",
      isinstance(d.get("operations_performed"), list) and len(d.get("operations_performed", [])) > 0,
      f"ops={d.get('operations_performed')}")

# ── PART 2: Natural language handling ────────────────────────
print("\n[PART 2 — Natural Language Handling]")

time.sleep(2)

# Clear request: "show all users"
s2, d2 = post_json(f"{BACKEND}/api/chat", {"message": "Show all users"})
check("NL-1: 'Show all users' → success (SQL)",
      s2 == 200 and d2.get("success") is True and d2.get("agent") == "sql",
      f"agent={d2.get('agent')}, success={d2.get('success')}, rows={len(d2.get('data') or [])}")

time.sleep(2)

# Clear request: "show all rides"
s3, d3 = post_json(f"{BACKEND}/api/chat", {"message": "Show all rides"})
check("NL-2: 'Show all rides' → success (SQL)",
      s3 == 200 and d3.get("success") is True and d3.get("agent") == "sql",
      f"agent={d3.get('agent')}, success={d3.get('success')}, rows={len(d3.get('data') or [])}")

# LIMIT 50 applied for full-row queries
if d3.get("success"):
    rows = len(d3.get("data") or [])
    check("NL-3: Full-row query has LIMIT 50 applied (≤50 rows)",
          rows <= 50,
          f"rows_returned={rows}")

time.sleep(2)

# Ambiguous: "show all records"
s4, d4 = post_json(f"{BACKEND}/api/chat", {"message": "show all records"})
check("NL-4: 'show all records' → agent=clarification (NOT generic error)",
      s4 == 200 and d4.get("agent") == "clarification",
      f"agent={d4.get('agent')}, answer_prefix={str(d4.get('answer',''))[:50]}")

check("NL-5: Clarification answer starts with CLARIFICATION_NEEDED:",
      str(d4.get("answer","")).startswith("CLARIFICATION_NEEDED:"),
      f"answer={str(d4.get('answer',''))[:60]}")

time.sleep(2)

# Security: DROP TABLE still blocked
s5, d5 = post_json(f"{BACKEND}/api/chat", {"message": "DROP TABLE users"})
check("SEC-1: DROP TABLE still blocked",
      d5.get("success") is False,
      f"agent={d5.get('agent')}, answer_prefix={str(d5.get('answer',''))[:50]}")

check("SEC-2: DROP response has agent unsafe/error/unknown (all = blocked)",
      d5.get("agent") in ("unsafe", "error", "cannot_generate", "unknown"),
      f"agent={d5.get('agent')}")

time.sleep(2)

# Multi-statement still blocked
s6, d6 = post_json(f"{BACKEND}/api/chat", {"message": "SELECT 1; DROP TABLE users"})
check("SEC-3: Multi-statement still blocked",
      d6.get("success") is False,
      f"agent={d6.get('agent')}")

time.sleep(2)

# Existing revenue query still works
s7, d7 = post_json(f"{BACKEND}/api/chat", {"message": "What is the total revenue?"})
check("REG-1: Total revenue query still works",
      s7 == 200 and d7.get("success") is True and d7.get("agent") == "sql",
      f"agent={d7.get('agent')}, answer={str(d7.get('answer',''))[:60]}")

time.sleep(2)

# Vehicle revenue query still works
s8, d8 = post_json(f"{BACKEND}/api/chat", {"message": "Which vehicle type generated the highest revenue?"})
check("REG-2: Vehicle revenue query still works",
      s8 == 200 and d8.get("success") is True,
      f"agent={d8.get('agent')}, answer={str(d8.get('answer',''))[:60]}")

# Summary
print(f"\n{'='*60}")
total  = len(results)
passed = sum(1 for _, p in results if p)
print(f"RESULTS: {passed}/{total} passed")
if passed < total:
    failed = [label for label, p in results if not p]
    print(f"Failed: {failed}")
else:
    print("ALL PASS")
print("="*60)
