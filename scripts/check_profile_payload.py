import urllib.request
import re

url = "https://opensea.io/C7F9B4"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
try:
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode("utf-8", errors="ignore")
        # search for items in the payload
        tokens = re.findall(r'/item/robinhood/0x27a0a6b0df634719863767832cbf99d3a80d65bd/(\d+)', html)
        print("Tokens on profile page HTML:", set(tokens))
        itemTypenames = re.findall(r'"tokenId":"(\d+)"', html)
        print("Token IDs in payload:", set(itemTypenames))
except Exception as e:
    print("Error:", e)
