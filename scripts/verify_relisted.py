import urllib.request
import re

urls = [
    'https://opensea.io/collection/mythical-beasts-guardians',
    'https://opensea.io/item/robinhood/0x27a0A6B0DF634719863767832CBF99D3a80d65bd/1',
    'https://opensea.io/item/robinhood/0x27a0A6B0DF634719863767832CBF99D3a80d65bd/1168'
]

for url in urls:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        with urllib.request.urlopen(req) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            delist = re.findall(r'"isDelisted":[a-z]+', html)
            typenames = [m for m in re.findall(r'"__typename":"[^"]+"', html) if 'Delist' in m or 'Item' in m or 'Collection' in m]
            print('URL:', url)
            print('HTTP:', resp.status)
            print('isDelisted:', set(delist))
            print('Typenames:', set(typenames[:8]))
            print('-' * 40)
    except Exception as e:
        print('URL:', url, 'Error:', e)
