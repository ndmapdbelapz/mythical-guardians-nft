import os
import json
import random
from PIL import Image

def generate_random_showcase_gif(num_tokens=24, duration_ms=320, target_size=(600, 600)):
    random.seed()  # Fresh true random seed
    
    manifest_path = "web/assets/tokens_manifest.json"
    if os.path.exists(manifest_path):
        with open(manifest_path, "r", encoding="utf-8") as f:
            manifest = json.load(f)
    else:
        manifest = [{"id": i} for i in range(1, 2223)]
        
    # Sample randomly across the full 2,222 collection
    selected = random.sample(manifest, min(num_tokens, len(manifest)))
    
    print(f"Randomly selected {len(selected)} Guardians for the GIF:")
    for idx, g in enumerate(selected, 1):
        g_id = g.get("id")
        arch = g.get("archetype", "Unknown")
        elem = g.get("element", "Unknown")
        tier = g.get("tier", "Standard")
        print(f"  {idx:2d}. Guardian #{g_id:04d} - {arch} ({elem}) [{tier}]")

    frames = []
    for g in selected:
        g_id = g.get("id")
        png_path = os.path.join("ART_PHOTOS_PNG", f"Guardian_{g_id:04d}.png")
        if not os.path.exists(png_path):
            print(f"Warning: {png_path} not found, skipping.")
            continue
            
        im = Image.open(png_path).convert("RGBA")
        if im.size != target_size:
            im = im.resize(target_size, Image.Resampling.LANCZOS)
            
        # Composite over elegant dark celestial background
        bg = Image.new("RGB", target_size, (9, 12, 18))
        bg.paste(im, mask=im.split()[3])
        frames.append(bg)

    if not frames:
        print("Error: No frames loaded.")
        return

    # Destinations
    dest_paths = [
        os.path.join("SOCIAL_ASSETS", "MYTHICAL_GUARDIANS_RANDOM_SHOWCASE.gif"),
        "MYTHICAL_GUARDIANS_RANDOM_SHOWCASE.gif",
        r"C:\Users\pc\Desktop\MYTHICAL_GUARDIANS_RANDOM_SHOWCASE.gif"
    ]

    for p in dest_paths:
        parent = os.path.dirname(p)
        if parent:
            os.makedirs(parent, exist_ok=True)
            
        frames[0].save(
            p,
            save_all=True,
            append_images=frames[1:],
            duration=duration_ms,
            loop=0,
            optimize=True
        )
        size_mb = os.path.getsize(p) / (1024 * 1024)
        print(f"Saved: {p} ({size_mb:.2f} MB)")

    print(f"\nSuccessfully generated random GIF with {len(frames)} frames directly to Desktop!")

if __name__ == "__main__":
    generate_random_showcase_gif()
