import urllib.request
import re

for tid in [1, 1168, 1193]:
    url = f"https://opensea.io/item/robinhood/0x27a0A6B0DF634719863767832CBF99D3a80d65bd/{tid}"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
    try:
        with urllib.request.urlopen(req) as resp:
            html = resp.read().decode("utf-8", errors="ignore")
            # find owner address
            owners = re.findall(r'"owner":\{"address":"(0x[a-fA-F0-9]{40})"', html)
            if not owners:
                owners = re.findall(r'"address":"(0x[a-fA-F0-9]{40})"[^}]*"user"', html)
            print(f"Token #{tid} HTTP:", resp.status, "Owners in JSON:", set(owners))
    except Exception as e:
        print(f"Token #{tid} Error:", e)
