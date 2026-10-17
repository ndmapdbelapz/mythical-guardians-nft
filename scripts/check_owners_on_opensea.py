import urllib.request
import json

def check_item(token_id):
    payload = {
        "query": """
        query ItemQuery($identifier: ItemIdentifierInput!) {
          itemByIdentifier(identifier: $identifier) {
            __typename
            ... on Item {
              name
              tokenId
              owners {
                edges {
                  node {
                    address
                    displayName
                  }
                }
              }
            }
          }
        }
        """,
        "variables": {
          "identifier": {
            "contractAddress": "0x27a0a6b0df634719863767832cbf99d3a80d65bd",
            "chain": "ROBINHOOD",
            "tokenId": str(token_id)
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
            data = json.loads(resp.read().decode("utf-8"))
            print(f"Token #{token_id}:", data)
    except Exception as e:
        print(f"Token #{token_id} Error:", e)

for tid in [1, 1168, 1193]:
    check_item(tid)
