import urllib.request
import re

url = "https://opensea.io/collection/mythical-beasts-guardians"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
try:
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode("utf-8", errors="ignore")
        print("Collection HTTP Status:", resp.status)
        tokens = re.findall(r'/item/robinhood/0x27a0a6b0df634719863767832cbf99d3a80d65bd/(\d+)', html)
        print("Tokens found on collection page:", set(tokens))
        itemCount = re.findall(r'"numOwners":(\d+)|"totalSupply":(\d+)|"itemCount":(\d+)', html)
        print("Stats found:", itemCount[:5])
except Exception as e:
    print("Error:", e)
