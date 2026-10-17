import urllib.request
import json

payload = {
    "query": """
    query UserItems($address: AddressScalar!) {
      account(address: $address) {
        address
      }
    }
    """,
    "variables": {"address": "0xc7f9b41e07a1cc37b551a3d0814e1ba15f2b6b07"}
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
