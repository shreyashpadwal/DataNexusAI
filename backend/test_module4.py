"""
test_module4.py -- Module 4 end-to-end tests.
Tests API connectivity (backend) + verifies frontend is serving.
Run from: backend/
Usage: venv/Scripts/python.exe -X utf8 test_module4.py
"""
import sys, io, json, time, urllib.request, urllib.error, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

BACKEND  = "http://localhost:8000"
FRONTEND = "http://localhost:5173"
SEP = "-" * 60
PASS, FAIL = "[PASS]", "[FAIL]"
results = []

def get(url, timeout=10):
    try:
        with urllib.request.urlopen(url, timeout=timeout) as r:
            body = r.read()
            ct   = r.headers.get("Content-Type", "")
            try:    return r.status, json.loads(body), ct
            except: return r.status, body.decode(errors="replace"), ct
    except urllib.error.HTTPError as e:
        return e.code, {}, ""
    except Exception as ex:
        return 0, str(ex), ""

def post_json(url, data, timeout=120):
    body = json.dumps(data).encode()
    req  = urllib.request.Request(url, data=body,
           headers={"Content-Type": "application/json"}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return e.code, {}
    except Exception as ex:
        return 0, {"_error": str(ex)}

def upload_csv(filepath, instructions="Clean this CSV and load it."):
    boundary = "TestBoundaryXYZ"
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
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return e.code, {}
    except Exception as ex:
        return 0, {"_error": str(ex)}

def check(label, passed, detail=""):
    print(f"\n{SEP}")
    print(f"TEST : {label}")
    if detail: print(f"  {detail}")
    print(f"  >> {PASS if passed else FAIL}")
    results.append(passed)
    return passed

print("=" * 60)
print("DataNexus AI -- Module 4 End-to-End Tests")
print("=" * 60)

# T1: Frontend serving
status, body, ct = get(FRONTEND, timeout=5)
check("T1: Frontend starts and serves HTML",
      status == 200 and ("DataNexus" in str(body) or "html" in ct.lower()),
      f"HTTP {status}, Content-Type: {ct[:50]}")

# T2: Backend health
status, data, _ = get(f"{BACKEND}/api/health")
check("T2: Backend health endpoint",
      status == 200 and data.get("status") == "ok",
      f"status={data.get('status')}, database={data.get('database')}")

# T3: CORS header present for Vite origin
req = urllib.request.Request(f"{BACKEND}/api/health",
      headers={"Origin": "http://localhost:5173"})
try:
    with urllib.request.urlopen(req, timeout=10) as r:
        cors = r.headers.get("Access-Control-Allow-Origin", "")
except Exception:
    cors = ""
check("T3: CORS header present for localhost:5173",
      bool(cors), f"Access-Control-Allow-Origin: {cors!r}")

# T4: Chat endpoint — natural language query
time.sleep(1)
status, data = post_json(f"{BACKEND}/api/chat", {"message": "What is the total revenue?"})
check("T4: Chat endpoint — total revenue query",
      status == 200 and data.get("success") is True and data.get("agent") == "sql",
      f"success={data.get('success')}, agent={data.get('agent')}, answer={str(data.get('answer',''))[:80]}")

# T5: Generated SQL returned
check("T5: Generated SQL returned in response",
      bool(data.get("sql")),
      f"sql: {str(data.get('sql',''))[:80]}")

# T6: Query results returned (tabular data)
check("T6: Query results (tabular data) in response",
      data.get("data") is not None and len(data.get("data", [])) > 0,
      f"rows returned: {len(data.get('data', []))}")

# T7: Chart-worthy query
time.sleep(2)
status7, data7 = post_json(f"{BACKEND}/api/chat",
                           {"message": "Which vehicle type generated the highest revenue?"})
has_data = data7.get("data") is not None and len(data7.get("data", [])) > 0
check("T7: Vehicle revenue query returns chartable data",
      status7 == 200 and data7.get("success") is True and has_data,
      f"rows={len(data7.get('data',[]))}, agent={data7.get('agent')}")

# T8: CSV upload through ETL endpoint
time.sleep(2)
csv_path = os.path.join(os.path.dirname(__file__), "test_data", "sample_rides.csv")
status8, data8 = upload_csv(csv_path, "Remove duplicates and handle missing values.")
check("T8: CSV upload works end-to-end",
      status8 == 200 and data8.get("success") is True,
      f"rows_loaded={data8.get('rows_loaded')}, dups={data8.get('duplicates_removed')}")

# T9: ETL result contains expected fields
check("T9: ETL response has all required fields",
      all(k in data8 for k in ["batch_id","rows_read","duplicates_removed",
                                "missing_values_handled","rows_loaded","operations_performed"]),
      f"ops={data8.get('operations_performed')}")

# T10: Invalid CSV (txt file) rejected
boundary = "TestBoundaryXYZ"
bad_body = (
    f"--{boundary}\r\nContent-Disposition: form-data; name=\"instructions\"\r\n\r\ntest\r\n"
    f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; "
    f"filename=\"bad.txt\"\r\nContent-Type: text/plain\r\n\r\nbad content"
    f"\r\n--{boundary}--\r\n"
).encode()
req = urllib.request.Request(f"{BACKEND}/api/etl/upload", data=bad_body,
      headers={"Content-Type": f"multipart/form-data; boundary={boundary}"}, method="POST")
try:
    with urllib.request.urlopen(req, timeout=30) as r:
        r10, d10 = r.status, json.loads(r.read())
except urllib.error.HTTPError as e:
    r10, d10 = e.code, {}
check("T10: Invalid .txt file rejected with error",
      d10.get("success") is False and "Unsupported" in str(d10.get("error","")),
      f"success={d10.get('success')}, error={str(d10.get('error',''))[:80]}")

# T11: SQL security — DROP TABLE still blocked
time.sleep(2)
status11, data11 = post_json(f"{BACKEND}/api/chat", {"message": "DROP TABLE users"})
check("T11: SQL security — DROP TABLE blocked",
      data11.get("success") is False,
      f"success={data11.get('success')}, agent={data11.get('agent')}")

# T12: ETL security — injection attempt via instructions
time.sleep(2)
status12, data12 = upload_csv(csv_path,
    instructions="import os; os.system('del *')")
check("T12: ETL security — malicious instructions treated as plain text",
      data12.get("success") is True,  # file still processes; instruction treated as text
      f"success={data12.get('success')}, rows_loaded={data12.get('rows_loaded')}")

# Summary
print(f"\n{'='*60}")
passed = sum(results)
print(f"RESULTS: {passed}/{len(results)} tests passed")
print("Module 4 is FULLY WORKING." if passed == len(results) else "Some tests need review.")
print("="*60)
