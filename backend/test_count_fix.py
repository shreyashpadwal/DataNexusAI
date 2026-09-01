"""
Validation tests for the answer-count consistency fix.
Run: venv\Scripts\python.exe -X utf8 test_count_fix.py
"""
import sys, io, json, time, urllib.request, urllib.error, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

BACKEND = "http://localhost:8000"
SEP = "-" * 60
results = []

# --- AUTH SETUP ---
test_email = f"test_count_{int(time.time())}@example.com"
req = urllib.request.Request(f"{BACKEND}/api/auth/register", data=json.dumps({"name": "Count Test", "email": test_email, "password": "pass"}).encode(), headers={"Content-Type": "application/json"}, method="POST")
try: urllib.request.urlopen(req)
except: pass
req = urllib.request.Request(f"{BACKEND}/api/auth/login", data=json.dumps({"email": test_email, "password": "pass"}).encode(), headers={"Content-Type": "application/json"}, method="POST")
with urllib.request.urlopen(req) as r:
    TOKEN = json.loads(r.read())["access_token"]
# ------------------

def post(msg, timeout=120):
    body = json.dumps({"message": msg}).encode()
    req  = urllib.request.Request(f"{BACKEND}/api/chat", data=body,
           headers={"Content-Type": "application/json", "Authorization": f"Bearer {TOKEN}"}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return e.code, {}
    except Exception as ex:
        return 0, {"_error": str(ex)}

def check(label, passed, detail=""):
    status = "[PASS]" if passed else "[FAIL]"
    print(f"\n{SEP}\nTEST : {label}")
    if detail: print(f"  {detail}")
    print(f"  >> {status}")
    results.append((label, passed))

def extract_number(text, keyword):
    """Find the first integer near a keyword in the answer text."""
    pattern = rf'{keyword}\D*?(\d+)'
    m = re.search(pattern, text, re.IGNORECASE)
    if m:
        return int(m.group(1))
    # Also look for digit before keyword
    m2 = re.search(rf'(\d+)\s+{keyword}', text, re.IGNORECASE)
    return int(m2.group(1)) if m2 else None

print("=" * 60)
print("DataNexus AI — Answer Count Consistency Tests")
print("=" * 60)

# ── Test 1: give all users ─────────────────────────────────────
s1, d1 = post("give all users")
rows1   = len(d1.get("data") or [])
ans1    = d1.get("answer", "")
check("T1: 'give all users' → success",
      d1.get("success") is True and d1.get("agent") == "sql",
      f"agent={d1.get('agent')}, success={d1.get('success')}, rows={rows1}")

check("T1: rows returned = 30",
      rows1 == 30,
      f"rows={rows1}")

# Answer must contain 30 — not 20, not any other number
n1 = extract_number(ans1, "user") or extract_number(ans1, "record") or extract_number(ans1, "result") or extract_number(ans1, "there")
check("T1: AI answer references 30 (not 20 or other)",
      "30" in ans1,
      f"answer={ans1[:120]}")

time.sleep(3)

# ── Test 2: show all users ─────────────────────────────────────
s2, d2 = post("show all users")
rows2   = len(d2.get("data") or [])
ans2    = d2.get("answer", "")
check("T2: 'show all users' → success",
      d2.get("success") is True,
      f"rows={rows2}")

check("T2: AI answer references 30",
      "30" in ans2,
      f"answer={ans2[:120]}")

time.sleep(3)

# ── Test 3: top 5 users ───────────────────────────────────────
s3, d3 = post("show top 5 users")
rows3   = len(d3.get("data") or [])
ans3    = d3.get("answer", "")
check("T3: 'show top 5 users' → ≤5 rows",
      rows3 <= 5,
      f"rows={rows3}")

check("T3: AI answer references 5",
      "5" in ans3,
      f"answer={ans3[:120]}")

time.sleep(3)

# ── Test 4: top 10 users ──────────────────────────────────────
s4, d4 = post("show top 10 users")
rows4   = len(d4.get("data") or [])
ans4    = d4.get("answer", "")
check("T4: 'show top 10 users' → ≤10 rows",
      rows4 <= 10,
      f"rows={rows4}")

check("T4: AI answer references 10",
      "10" in ans4,
      f"answer={ans4[:120]}")

time.sleep(3)

# ── Test 5: total revenue (aggregate — must still work) ────────
s5, d5 = post("What is the total revenue?")
ans5    = d5.get("answer", "")
check("T5: total revenue → success",
      d5.get("success") is True,
      f"answer={ans5[:80]}")

check("T5: revenue answer contains Rs.",
      "26" in ans5 or "rs" in ans5.lower() or "revenue" in ans5.lower(),
      f"answer={ans5[:80]}")

time.sleep(3)

# ── Test 6: rides by city (grouped result) ─────────────────────
s6, d6 = post("show rides by city")
rows6   = len(d6.get("data") or [])
ans6    = d6.get("answer", "")
check("T6: 'show rides by city' → success",
      d6.get("success") is True,
      f"rows={rows6}, answer={ans6[:80]}")

# Summary
print(f"\n{'='*60}")
total  = len(results)
passed = sum(1 for _, p in results if p)
print(f"RESULTS: {passed}/{total} passed")
if passed < total:
    print("Failed:", [l for l, p in results if not p])
else:
    print("ALL PASS")
print("="*60)
