import json, urllib.request

req = urllib.request.Request('http://localhost:8000/api/chat',
      data=json.dumps({'message': 'show rides by city'}).encode(),
      headers={'Content-Type': 'application/json'}, method='POST')
try:
    with urllib.request.urlopen(req, timeout=120) as r:
        d = json.loads(r.read())
        print(f"agent: {d.get('agent')}")
        print(f"success: {d.get('success')}")
        print(f"rows: {len(d.get('data') or [])}")
        print(f"answer: {str(d.get('answer',''))[:150]}")
except Exception as e:
    print(e)
