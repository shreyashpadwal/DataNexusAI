"""Quick T2 retry — verify duplicate removal works with smart fallback."""
import sys, io, json, urllib.request, time
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

BASE     = "http://localhost:8000"
CSV_FILE = "test_data/sample_rides.csv"
BOUNDARY = "DataNexusBoundary99"

time.sleep(4)  # let server fully start

with open(CSV_FILE, "rb") as f:
    file_data = f.read()

body = (
    f"--{BOUNDARY}\r\n"
    f'Content-Disposition: form-data; name="instructions"\r\n\r\n'
    f"Remove duplicate rows and load.\r\n"
    f"--{BOUNDARY}\r\n"
    f'Content-Disposition: form-data; name="file"; filename="sample_rides.csv"\r\n'
    f"Content-Type: text/csv\r\n\r\n"
).encode() + file_data + f"\r\n--{BOUNDARY}--\r\n".encode()

req = urllib.request.Request(
    f"{BASE}/api/etl/upload", data=body,
    headers={"Content-Type": f"multipart/form-data; boundary={BOUNDARY}"},
    method="POST"
)

with urllib.request.urlopen(req, timeout=120) as r:
    result = json.loads(r.read())

print("T2 retry — Remove duplicate rows:")
print(f"  success            : {result.get('success')}")
print(f"  duplicates_removed : {result.get('duplicates_removed')}")
print(f"  missing_handled    : {result.get('missing_values_handled')}")
print(f"  rows_loaded        : {result.get('rows_loaded')}")
print(f"  ops_performed      : {result.get('operations_performed')}")
print(f"  answer             : {str(result.get('answer',''))[:120]}")
ok = result.get("duplicates_removed", 0) >= 1
print(f"\n  >> {'[PASS]' if ok else '[FAIL]'}")
