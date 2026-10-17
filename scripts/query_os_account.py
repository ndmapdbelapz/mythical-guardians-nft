import urllib.request
import json

payload = {
    "query": "query AccountQuery($name: String!) { account(name: $name) { address user { publicUsername } } }",
    "variables": {"name": "C7F9B4"}
}

req = urllib.request.Request(
    "https://opensea.io/__api/graphql/",
    headers={"Content-Type": "application/json", "User-Agent": "Mozilla/5.0"},
    data=json.dumps(payload).encode("utf-8")
)
try:
    with urllib.request.urlopen(req) as resp:
        print(resp.read().decode("utf-8"))
except Exception as e:
    print("Error:", e)
