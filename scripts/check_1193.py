import urllib.request
import re

url = "https://opensea.io/item/robinhood/0x27a0A6B0DF634719863767832CBF99D3a80d65bd/1193"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
try:
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode("utf-8", errors="ignore")
        print("HTTP Status:", resp.status)
        print("Includes DelistedItem:", "DelistedItem" in html)
        print("Includes Item:", '"__typename":"Item"' in html)
        names = re.findall(r'"name":"([^"]+)"', html)
        print("Names found:", names[:5])
        images = re.findall(r'"imageUrl":"([^"]+)"', html)
        print("Images found:", images[:5])
except Exception as e:
    print("Error:", e)
