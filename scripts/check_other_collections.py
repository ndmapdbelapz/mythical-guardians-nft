import urllib.request
import re

collections = ["mythical-beasts-guardians", "hood-pepas", "the-musegodmuses"]

for slug in collections:
    url = f"https://opensea.io/collection/{slug}"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
    try:
        with urllib.request.urlopen(req) as resp:
            html = resp.read().decode("utf-8", errors="ignore")
            itemCount = re.findall(r'"totalSupply":(\d+)|"itemCount":(\d+)', html)
            print(slug, "itemCount:", itemCount[:3])
    except Exception as e:
        print(slug, "Error:", e)
