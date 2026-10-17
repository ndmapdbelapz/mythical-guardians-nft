import os
import json
from PIL import Image

def create_showcase_gif():
    manifest_path = "web/assets/tokens_manifest.json"
    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    # 1. Start with the user's minted tokens
    priority_ids = [1, 1168, 1193]
    selected = []

    # Map manifest by ID
    id_map = {t["id"]: t for t in manifest}
    for pid in priority_ids:
        if pid in id_map:
            selected.append(id_map[pid])

    # 2. Pick top-tier Guardians across all 8 archetypes and 5 elements
    archetypes = [
        "Azure Dragon", "Vermilion Bird", "White Tiger", "Black Tortoise",
        "Nine-Tailed Fox", "Qilin", "Garuda", "Tengu"
    ]
    elements = ["Fire", "Water", "Earth", "Air", "Void"]

    # Collect high tier (Mythic & Legendary) candidates
    mythics = [t for t in manifest if t.get("tier") == "Mythic" and t["id"] not in priority_ids]
    legendaries = [t for t in manifest if t.get("tier") == "Legendary" and t["id"] not in priority_ids]
    epics = [t for t in manifest if t.get("tier") == "Epic" and t["id"] not in priority_ids]

    # Add a balanced selection of mythics and legendaries
    for t in mythics:
        if len(selected) >= 12:
            break
        selected.append(t)

    for t in legendaries:
        if len(selected) >= 18:
            break
        # make sure diverse archetypes
        if not any(s["archetype"] == t["archetype"] and s["element"] == t["element"] for s in selected):
            selected.append(t)

    for t in epics:
        if len(selected) >= 20:
            break
        selected.append(t)

    # If still under 20, fill up
    for t in manifest:
        if len(selected) >= 20:
            break
        if t["id"] not in [s["id"] for s in selected]:
            selected.append(t)

    print(f"Selected {len(selected)} Guardians for the Showcase GIF:")
    for idx, g in enumerate(selected, 1):
        print(f"  {idx:2d}. Guardian #{g['id']:04d} - {g['archetype']} ({g['element']}) [{g.get('tier', 'Common')}] Power: {g.get('power', 0)}")

    # 3. Load PNG images
    frames = []
    target_size = (600, 600)  # Optimal for Twitter/X and Discord

    for g in selected:
        png_filename = f"Guardian_{g['id']:04d}.png"
        png_path = os.path.join("ART_PHOTOS_PNG", png_filename)
        if not os.path.exists(png_path):
            print(f"Warning: {png_path} not found!")
            continue

        im = Image.open(png_path).convert("RGBA")
        if im.size != target_size:
            im = im.resize(target_size, Image.Resampling.LANCZOS)

        # Convert RGBA to RGB with dark background for clean GIF quantization
        bg = Image.new("RGB", target_size, (10, 12, 16))
        bg.paste(im, mask=im.split()[3])  # 3 is alpha channel
        frames.append(bg)

    output_dir = "SOCIAL_ASSETS"
    os.makedirs(output_dir, exist_ok=True)
    gif_path = os.path.join(output_dir, "MYTHICAL_GUARDIANS_20_SHOWCASE.gif")
    
    # Also save one in the root directory for easy access
    root_gif_path = "MYTHICAL_GUARDIANS_20_SHOWCASE.gif"

    # Frame duration in milliseconds (300ms = 0.3s per frame, ~3.3 fps - perfect loop)
    duration_ms = 350

    frames[0].save(
        gif_path,
        save_all=True,
        append_images=frames[1:],
        duration=duration_ms,
        loop=0,
        optimize=True
    )

    frames[0].save(
        root_gif_path,
        save_all=True,
        append_images=frames[1:],
        duration=duration_ms,
        loop=0,
        optimize=True
    )

    size_mb = os.path.getsize(gif_path) / (1024 * 1024)
    print(f"\nSUCCESS! Created animated GIF:")
    print(f"  Path: {os.path.abspath(gif_path)}")
    print(f"  File Size: {size_mb:.2f} MB")
    print(f"  Dimensions: {target_size[0]}x{target_size[1]}")
    print(f"  Total Frames: {len(frames)}")

if __name__ == "__main__":
    create_showcase_gif()
