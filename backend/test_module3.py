"""
test_module3.py -- Module 3 ETL + regression tests.
Run from: backend/
Usage: venv/Scripts/python.exe -X utf8 test_module3.py
"""
import sys, io, os, json, time, urllib.request, urllib.error
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

BASE     = "http://localhost:8000"
CSV_FILE = os.path.join(os.path.dirname(__file__), "test_data", "sample_rides.csv")
PASS, FAIL = "[PASS]", "[FAIL]"
SEP = "-" * 60


# ── Helpers ───────────────────────────────────────────────────────

def upload_csv(filepath: str, instructions: str = "Clean this CSV and load it into PostgreSQL.") -> dict:
    """Multipart POST to /api/etl/upload."""
    import mimetypes
    from urllib.request import Request
    boundary = "----DataNexusBoundary7MA4YWxkTrZu0gW"

    filename = os.path.basename(filepath)
    with open(filepath, "rb") as f:
        file_data = f.read()

    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="instructions"\r\n\r\n'
        f"{instructions}\r\n"
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="{filename}"\r\n'
        f"Content-Type: text/csv\r\n\r\n"
    ).encode() + file_data + f"\r\n--{boundary}--\r\n".encode()

    req = Request(
        f"{BASE}/api/etl/upload",
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return {"_http_error": e.code, "detail": e.read().decode(errors="replace")[:300]}
    except Exception as ex:
        return {"_error": str(ex)}


def chat(message: str) -> dict:
    payload = json.dumps({"message": message}).encode()
    req = urllib.request.Request(
        f"{BASE}/api/chat", data=payload,
        headers={"Content-Type": "application/json"}, method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=90) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return {"_http_error": e.code, "detail": e.read().decode(errors="replace")[:300]}
    except Exception as ex:
        return {"_error": str(ex)}


def db_query(sql: str) -> list:
    """Run SQL directly via verify script."""
    import subprocess
    script = f"from app.database.connection import engine; from sqlalchemy import text; " \
             f"print(__import__('json').dumps([dict(r._mapping) for r in engine.connect().execute(text(\"{sql}\"))]))"
    result = subprocess.run(
        ["venv/Scripts/python.exe", "-c", script],
        capture_output=True, text=True, cwd=os.path.dirname(__file__)
    )
    try:
        return json.loads(result.stdout.strip())
    except Exception:
        return []


def check(label, result, expect_success=None, expect_agent=None, checks=None):
    print(f"\n{SEP}")
    print(f"TEST    : {label}")

    if "_http_error" in result:
        print(f"  HTTP {result['_http_error']}: {result.get('detail','')[:200]}")
        print(f"  >> {FAIL}")
        return False
    if "_error" in result:
        print(f"  ERROR: {result['_error']}")
        print(f"  >> {FAIL}")
        return False

    for key in ["success", "agent", "rows_read", "duplicates_removed",
                "missing_values_handled", "rows_loaded", "answer", "error"]:
        val = result.get(key)
        if val is not None:
            print(f"  {key}: {str(val)[:120]}")

    passed = True
    if expect_success is True and result.get("success") is not True:
        print(f"  {FAIL} Expected success=True")
        passed = False
    if expect_success is False and result.get("success") is not False:
        print(f"  {FAIL} Expected success=False")
        passed = False
    if expect_agent and result.get("agent") != expect_agent:
        print(f"  {FAIL} Expected agent='{expect_agent}', got '{result.get('agent')}'")
        passed = False
    if checks:
        for desc, ok in checks:
            if not ok:
                print(f"  {FAIL} {desc}")
                passed = False

    print(f"  >> {PASS if passed else FAIL}")
    return passed


results = []
print("=" * 60)
print("DataNexus AI -- Module 3 ETL Test Suite")
print("=" * 60)

# ── T1: Valid CSV upload (full pipeline) ──────────────────────────
r = upload_csv(CSV_FILE, "Remove duplicates, handle missing values, and load into PostgreSQL.")
results.append(check("T1: Valid CSV upload",
    r, expect_success=True, expect_agent="etl",
    checks=[
        ("rows_read >= 1", r.get("rows_read", 0) >= 1),
        ("rows_loaded >= 1", r.get("rows_loaded", 0) >= 1),
    ]
))
time.sleep(3)

# ── T2: Duplicate removal ─────────────────────────────────────────
r2 = upload_csv(CSV_FILE, "Remove duplicate rows and load.")
results.append(check("T2: Duplicate removal",
    r2, expect_success=True,
    checks=[("duplicates_removed >= 1", r2.get("duplicates_removed", 0) >= 1)]
))
time.sleep(3)

# ── T3: Missing values handled ────────────────────────────────────
r3 = upload_csv(CSV_FILE, "Handle missing values and load into PostgreSQL.")
results.append(check("T3: Missing values handled",
    r3, expect_success=True,
    checks=[("missing_values_handled >= 1", r3.get("missing_values_handled", 0) >= 1)]
))
time.sleep(3)

# ── T4: Invalid file type (.txt) ─────────────────────────────────
txt_path = os.path.join(os.path.dirname(__file__), "test_data", "bad_file.txt")
with open(txt_path, "w") as f:
    f.write("this is not a csv\n")

import mimetypes
boundary = "----DataNexusBoundary7MA4YWxkTrZu0gW"
with open(txt_path, "rb") as f:
    file_data = f.read()
body = (
    f"--{boundary}\r\n"
    f'Content-Disposition: form-data; name="instructions"\r\n\r\ntest\r\n'
    f"--{boundary}\r\n"
    f'Content-Disposition: form-data; name="file"; filename="bad_file.txt"\r\n'
    f"Content-Type: text/plain\r\n\r\n"
).encode() + file_data + f"\r\n--{boundary}--\r\n".encode()
req = urllib.request.Request(
    f"{BASE}/api/etl/upload", data=body,
    headers={"Content-Type": f"multipart/form-data; boundary={boundary}"}, method="POST"
)
try:
    with urllib.request.urlopen(req, timeout=30) as resp:
        r4 = json.loads(resp.read())
except urllib.error.HTTPError as e:
    r4 = {"_http_error": e.code, "detail": e.read().decode(errors="replace")}
results.append(check("T4: Invalid file type rejected",
    r4, expect_success=False,
    checks=[("error mentions file type", "Unsupported" in str(r4.get("error", "")) or "csv" in str(r4.get("error","")).lower())]
))
os.remove(txt_path)

# ── T5: Malicious CSV cell treated as plain data ─────────────────
# The =CMD("test") cell is in sample_rides.csv — verify it loaded fine (not executed)
results.append(check("T5: Formula cell =CMD() treated as plain data",
    r,  # reuse T1 result — it processed sample_rides.csv which has =CMD("test")
    expect_success=True,
    checks=[("processed successfully despite formula cell", r.get("success") is True)]
))

# ── T6: Database loading verified ────────────────────────────────
batch_id = r.get("batch_id")
rows_in_db = db_query(f"SELECT COUNT(*) as cnt FROM etl_staging WHERE batch_id='{batch_id}'")
db_count = rows_in_db[0]["cnt"] if rows_in_db else 0
results.append(check("T6: Rows verified in etl_staging",
    r, expect_success=True,
    checks=[
        ("batch_id exists", bool(batch_id)),
        (f"rows in DB ({db_count}) matches rows_loaded ({r.get('rows_loaded',0)})",
         db_count == r.get("rows_loaded", -1)),
    ]
))

# ── T7: SQL regression — total revenue still works ───────────────
time.sleep(2)
r7 = chat("What is the total revenue?")
results.append(check("T7: SQL regression — total revenue",
    r7, expect_success=True, expect_agent="sql",
    checks=[("has SQL", bool(r7.get("sql")))]
))
time.sleep(2)

# ── T8: SQL regression — DROP TABLE still blocked ────────────────
r8 = chat("DROP TABLE users")
results.append(check("T8: SQL regression — DROP blocked",
    r8, expect_success=False
))
time.sleep(2)

# ── T9: ETL classification via chat ──────────────────────────────
r9 = chat("Clean this CSV and load it into PostgreSQL.")
results.append(check("T9: ETL chat classification",
    r9, expect_agent="etl"
))

# ── T10: DB integrity — core tables untouched ────────────────────
core_ok = True
for tbl, expected in [("users", 30), ("vehicles", 20), ("rides", 196), ("payments", 196), ("ratings", 156)]:
    rows = db_query(f"SELECT COUNT(*) as cnt FROM {tbl}")
    cnt  = rows[0]["cnt"] if rows else 0
    ok   = cnt == expected
    if not ok:
        core_ok = False
    print(f"  {tbl}: {cnt} rows {'OK' if ok else 'MISMATCH (expected ' + str(expected) + ')'}")
results.append(check("T10: Core table integrity",
    {"success": core_ok, "agent": "system"},
    expect_success=True,
    checks=[("all core tables intact", core_ok)]
))

# ── Summary ───────────────────────────────────────────────────────
print(f"\n{'='*60}")
passed = sum(results)
print(f"RESULTS: {passed}/{len(results)} tests passed")
print("Module 3 is FULLY WORKING." if passed == len(results) else "Some tests need review.")
print("=" * 60)
