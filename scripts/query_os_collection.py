import urllib.request
import json

payload = {
    "query": """
    query ItemQuery($identifier: ItemIdentifierInput!) {
      itemByIdentifier(identifier: $identifier) {
        __typename
        ... on Item {
          name
          tokenId
        }
      }
    }
    """,
    "variables": {
      "identifier": {
        "contractAddress": "0x27a0a6b0df634719863767832cbf99d3a80d65bd",
        "chain": "ROBINHOOD",
        "tokenId": "1193"
      }
    }
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
