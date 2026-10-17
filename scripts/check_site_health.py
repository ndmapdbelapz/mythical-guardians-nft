import os
import re
import urllib.request
import ssl

def check_site():
    print("=== 1. Checking Local Files in web/ ===")
    with open("web/index.html", "r", encoding="utf-8") as f:
        html = f.read()
        
    links = re.findall(r'(?:src|href)=["\']([^"\']+)["\']', html)
    local_links = [l for l in links if not l.startswith("http") and not l.startswith("#")]
    print(f"Found {len(local_links)} relative links in web/index.html:")
    for l in set(local_links):
        clean_path = l.split("?")[0]
        full_path = os.path.join("web", clean_path)
        exists = os.path.exists(full_path)
        status = "OK" if exists else "MISSING"
        print(f"  [{status}] {l} -> {full_path}")

    print("\n=== 2. Checking Remote URL: https://mythicalguardians.xyz/ ===")
    ctx = ssl.create_default_context()
    for test_url in [
        "https://mythicalguardians.xyz/",
        "https://mythicalguardians.xyz/web/",
        "https://mythicalguardians.xyz/web/app.js?v=6",
        "https://mythicalguardians.xyz/web/style.css?v=6",
        "https://mythicalguardians.xyz/web/assets/tokens_manifest.json"
    ]:
        try:
            req = urllib.request.Request(test_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
                print(f"  [HTTP {resp.status}] {test_url}")
        except Exception as e:
            print(f"  [ERROR] {test_url} -> {e}")

    print("\n=== 3. Checking Local Server: http://127.0.0.1:3000/ ===")
    try:
        req = urllib.request.Request("http://127.0.0.1:3000/", headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as resp:
            print(f"  [HTTP {resp.status}] http://127.0.0.1:3000/")
    except Exception as e:
        print(f"  [ERROR] http://127.0.0.1:3000/ -> {e}")

if __name__ == "__main__":
    check_site()
