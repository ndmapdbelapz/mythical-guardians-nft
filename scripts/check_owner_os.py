import urllib.request
import re

url = "https://opensea.io/0xC7F9B41E07a1CC37b551A3D0814E1ba15F2B6B07"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
try:
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode("utf-8", errors="ignore")
        print("HTTP Status:", resp.status)
        usernames = re.findall(r'"publicUsername":"([^"]+)"', html)
        print("publicUsername:", set(usernames))
        displayNames = re.findall(r'"displayName":"([^"]+)"', html)
        print("displayName:", set(displayNames))
except Exception as e:
    print("Error:", e)
