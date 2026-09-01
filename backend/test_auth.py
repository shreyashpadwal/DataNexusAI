import sys, io, json, time, urllib.request, urllib.error
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

BACKEND = "http://localhost:8000"

def post(endpoint, data=None, token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
        
    req = urllib.request.Request(
        f"{BACKEND}{endpoint}", 
        data=json.dumps(data).encode() if data else b"",
        headers=headers, 
        method="POST"
    )
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())

def get(endpoint, token=None):
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
        
    req = urllib.request.Request(f"{BACKEND}{endpoint}", headers=headers, method="GET")
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())

print("Testing Auth Flow...")

# 1. Register
email = f"test_{int(time.time())}@example.com"
status, data = post("/api/auth/register", {"name": "Test User", "email": email, "password": "password123"})
print("Register:", status, data)
assert status == 200, "Registration failed"
assert data["email"] == email

# 2. Duplicate Register
status, data = post("/api/auth/register", {"name": "Test User 2", "email": email, "password": "password123"})
print("Duplicate Register:", status, data)
assert status == 400, "Should reject duplicate"

# 3. Login
status, data = post("/api/auth/login", {"email": email, "password": "password123"})
print("Login:", status, "token generated" if "access_token" in data else data)
assert status == 200, "Login failed"
token = data["access_token"]

# 4. Bad Login
status, data = post("/api/auth/login", {"email": email, "password": "wrong"})
print("Bad Login:", status, data)
assert status == 401, "Should reject wrong password"

# 5. Get Me (Valid Token)
status, data = get("/api/auth/me", token)
print("Get Me:", status, data)
assert status == 200, "Me failed"
assert data["email"] == email
assert "password_hash" not in data

# 6. Get Me (No Token) — HTTPBearer returns 403 when Authorization header is absent
status, data = get("/api/auth/me")
print("Get Me (No Token):", status, data)
assert status in (401, 403), f"Should reject missing token, got {status}"

# 7. Protected Route (Valid Token)
status, data = post("/api/chat", {"message": "hello"}, token)
print("Protected Chat (Valid):", status)
assert status == 200, "Protected chat failed"

# 8. Protected Route (No Token) — HTTPBearer returns 403 when Authorization header is absent
status, data = post("/api/chat", {"message": "hello"})
print("Protected Chat (No Token):", status)
assert status in (401, 403), f"Should reject missing token, got {status}"

print("\nALL AUTH TESTS PASSED!")
