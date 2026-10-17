import urllib.request
import re

url = 'https://opensea.io/item/robinhood/0x27a0a6b0df634719863767832cbf99d3a80d65bd/1'
req = urllib.request.Request(
    url,
    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
)
try:
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
        print('HTTP Status:', resp.status)
        delist = re.findall(r'\"isDelisted\":[a-z]+', html)
        print('Delist matches:', set(delist))
        typenames = [m for m in re.findall(r'\"__typename\":\"[^\"]+\"', html) if 'Delist' in m or 'Item' in m]
        print('Relevant typenames:', set(typenames))
        for line in html.split('\n'):
            if 'delisted' in line.lower():
                print('Snippet:', line[:200])
except Exception as e:
    print('Error:', e)
