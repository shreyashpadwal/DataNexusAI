"""
test_module2.py -- Module 2 end-to-end tests.
Run from: backend/
Usage: venv/Scripts/python.exe -X utf8 test_module2.py
"""
import sys
import io
import time
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

import json
import urllib.request
import urllib.error

BASE = "http://localhost:8000"
PASS = "[PASS]"
FAIL = "[FAIL]"
SEP  = "-" * 60


def chat(message: str) -> dict:
    """Send POST /api/chat and return parsed JSON response."""
    payload = json.dumps({"message": message}).encode()
    req = urllib.request.Request(
        f"{BASE}/api/chat",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=90) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors="replace")
        return {"_http_error": e.code, "detail": body}
    except Exception as ex:
        return {"_error": str(ex)}


def check(label, result, expect_success=True, expect_agent=None, must_have_data=False):
    print(f"\n{SEP}")
    print(f"TEST    : {label}")

    if "_http_error" in result:
        print(f"  HTTP ERROR {result['_http_error']}: {result.get('detail','')[:200]}")
        print(f"  >> {FAIL}")
        return False
    if "_error" in result:
        print(f"  CONNECTION ERROR: {result['_error']}")
        print(f"  >> {FAIL}")
        return False

    agent   = result.get("agent", "?")
    success = result.get("success", "?")
    sql     = result.get("sql") or "None"
    answer  = result.get("answer") or "None"
    rows    = len(result.get("data") or [])
    steps   = result.get("steps", [])

    print(f"Agent   : {agent}")
    print(f"Success : {success}")
    print(f"SQL     : {sql[:120]}")
    print(f"Answer  : {answer[:150]}")
    print(f"Rows    : {rows}")
    print(f"Steps   : {steps}")

    passed = True

    if expect_success is True and success is not True:
        print(f"  {FAIL} Expected success=True, got {success}")
        passed = False
    if expect_success is False and success is not False:
        print(f"  {FAIL} Expected success=False, got {success}")
        passed = False
    if expect_agent and agent != expect_agent:
        print(f"  {FAIL} Expected agent='{expect_agent}', got '{agent}'")
        passed = False
    if must_have_data and rows == 0:
        print(f"  {FAIL} Expected data rows > 0")
        passed = False

    print(f"  >> {PASS if passed else FAIL}")
    return passed


results = []

print("=" * 60)
print("DataNexus AI -- Module 2 Test Suite")
print("=" * 60)

# ── TEST 1: Basic aggregation ─────────────────────────────────────
r = chat("What is the total revenue?")
results.append(check("T1: Total revenue", r,
                     expect_success=True, expect_agent="sql", must_have_data=True))
time.sleep(2)

# ── TEST 2: Average ───────────────────────────────────────────────
r = chat("What is the average customer rating?")
results.append(check("T2: Average rating", r,
                     expect_success=True, expect_agent="sql", must_have_data=True))
time.sleep(2)

# ── TEST 3: JOIN ──────────────────────────────────────────────────
r = chat("Which vehicle type generated the highest revenue?")
results.append(check("T3: Vehicle type revenue (JOIN)", r,
                     expect_success=True, expect_agent="sql", must_have_data=True))
time.sleep(2)

# ── TEST 4: GROUP BY ─────────────────────────────────────────────
r = chat("Show the number of rides by city.")
results.append(check("T4: Rides by city (GROUP BY)", r,
                     expect_success=True, expect_agent="sql", must_have_data=True))
time.sleep(2)

# ── TEST 5: Top N ─────────────────────────────────────────────────
r = chat("Show the top 5 vehicles by revenue.")
results.append(check("T5: Top 5 vehicles", r,
                     expect_success=True, expect_agent="sql", must_have_data=True))
time.sleep(2)

# ── TEST 6: Security — DROP TABLE ─────────────────────────────────
# Expected: Router classifies as UNKNOWN or SQL agent rejects it
# Either way success=False and no DB operation executed
r = chat("Drop the users table.")
results.append(check("T6: SECURITY — DROP TABLE blocked", r,
                     expect_success=False))   # must NOT succeed
time.sleep(2)

# ── TEST 7: Security — multi-statement ───────────────────────────
r = chat("SELECT * FROM users; DROP TABLE users;")
results.append(check("T7: SECURITY — multi-statement blocked", r,
                     expect_success=False))   # must NOT succeed
time.sleep(2)

# ── TEST 8: ETL deferred ──────────────────────────────────────────
# ETL is identified and a helpful message returned (agent="etl")
r = chat("Clean this CSV and load it into PostgreSQL.")
results.append(check("T8: ETL deferred to Module 3", r,
                     expect_agent="etl"))    # just check routing, not success flag
time.sleep(1)

# ── SUMMARY ──────────────────────────────────────────────────────
print(f"\n{'=' * 60}")
passed = sum(results)
total  = len(results)
print(f"RESULTS: {passed}/{total} tests passed")
print("Module 2 is FULLY WORKING." if passed == total else "Some tests need review.")
print("=" * 60)
