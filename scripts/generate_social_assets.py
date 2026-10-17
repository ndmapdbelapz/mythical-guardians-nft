import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PNG_DIR = os.path.join(ROOT_DIR, "ART_PHOTOS_PNG")
OUT_DIR = os.path.join(ROOT_DIR, "SOCIAL_ASSETS")

os.makedirs(OUT_DIR, exist_ok=True)

# Fonts
FONT_HEADING = r"C:\Windows\Fonts\georgiab.ttf"
FONT_BODY = r"C:\Windows\Fonts\arialbd.ttf"
FONT_REGULAR = r"C:\Windows\Fonts\arial.ttf"

def load_guardian(num, size=(400, 400), feather=35):
    filename = f"Guardian_{str(num).zfill(4)}.png"
    filepath = os.path.join(PNG_DIR, filename)
    if not os.path.exists(filepath):
        return None
    img = Image.open(filepath).convert("RGBA")
    img = img.resize(size, Image.Resampling.LANCZOS)
    
    if feather > 0:
        w, h = size
        mask = Image.new("L", (w, h), 0)
        draw = ImageDraw.Draw(mask)
        draw.ellipse([feather//2, feather//2, w - feather//2, h - feather//2], fill=255)
        mask = mask.filter(ImageFilter.GaussianBlur(feather))
        
        r, g, b, a = img.split()
        final_a = ImageChops.multiply(a, mask)
        img.putalpha(final_a)
        
    return img

def create_x_pfp():
    """1000x1000 Avatar for X / Twitter Profile"""
    width, height = 1000, 1000
    base = Image.new("RGBA", (width, height), (8, 10, 14, 255))
    draw = ImageDraw.Draw(base)

    # Cosmic glowing radial background
    for r in range(480, 0, -10):
        alpha = int(55 * (1 - r / 480))
        draw.ellipse([500 - r, 500 - r, 500 + r, 500 + r], fill=(212, 175, 55, alpha))

    # Center Grail Guardian (Azure Dragon #0004)
    guardian = load_guardian(4, size=(820, 820), feather=20)
    if guardian:
        base.paste(guardian, (90, 80), guardian)

    # Outer luxury gold concentric rings
    draw.ellipse([25, 25, 975, 975], outline=(255, 215, 0, 240), width=6)
    draw.ellipse([40, 40, 960, 960], outline=(212, 175, 55, 120), width=2)
    draw.ellipse([15, 15, 985, 985], outline=(140, 110, 30, 80), width=2)

    out_path = os.path.join(OUT_DIR, "X_PROFILE_PICTURE_1000x1000.png")
    base.convert("RGB").save(out_path, quality=95)
    print(f"[+] Created: {out_path}")

def create_opensea_pfp():
    """1000x1000 Avatar / Logo for OpenSea Profile"""
    width, height = 1000, 1000
    base = Image.new("RGBA", (width, height), (7, 9, 13, 255))
    draw = ImageDraw.Draw(base)

    # Radiant golden circular glow
    for r in range(470, 0, -12):
        alpha = int(60 * (1 - r / 470))
        draw.ellipse([500 - r, 500 - r, 500 + r, 500 + r], fill=(212, 175, 55, alpha))

    # Feature Vermilion Bird #0003 clipped strictly to circle
    guardian = load_guardian(3, size=(780, 780), feather=0)
    if guardian:
        c_mask = Image.new("L", (780, 780), 0)
        c_draw = ImageDraw.Draw(c_mask)
        c_draw.ellipse([20, 20, 760, 760], fill=255)
        c_mask = c_mask.filter(ImageFilter.GaussianBlur(10))
        r, g, b, a = guardian.split()
        guardian.putalpha(ImageChops.multiply(a, c_mask))
        base.paste(guardian, (110, 100), guardian)

    # Concentric gold crest border
    draw.ellipse([25, 25, 975, 975], outline=(255, 215, 0, 240), width=7)
    draw.ellipse([42, 42, 958, 958], outline=(212, 175, 55, 140), width=2)

    # Bottom plaque badge
    draw.rounded_rectangle([330, 885, 670, 935], radius=25, fill=(12, 15, 22, 240), outline=(255, 215, 0, 220), width=2)
    try:
        font_sub = ImageFont.truetype(FONT_BODY, 22)
        draw.text((500, 910), "GENESIS • 2,222", fill=(255, 215, 0), font=font_sub, anchor="mm")
    except Exception:
        pass

    out_path = os.path.join(OUT_DIR, "OPENSEA_PROFILE_LOGO_1000x1000.png")
    base.convert("RGB").save(out_path, quality=95)
    print(f"[+] Created: {out_path}")

def create_x_banner():
    """1500x500 Header Banner for X / Twitter (3:1)"""
    width, height = 1500, 500
    base = Image.new("RGBA", (width, height), (6, 8, 12, 255))
    draw = ImageDraw.Draw(base)

    # Cosmic nebulae
    for r in range(450, 0, -25):
        draw.ellipse([1100 - r, 250 - r, 1100 + r, 250 + r], fill=(212, 175, 55, int(22 * (1 - r / 450))))

    # Smoothly feathered guardians on the right
    guardians_data = [
        (1, 740, 50, 390),   # Black Tortoise
        (5, 910, 40, 420),   # White Tiger
        (3, 1080, 30, 430),  # Vermilion Bird
        (4, 1230, 10, 470)   # Azure Dragon
    ]
    for gid, gx, gy, gsz in guardians_data:
        g = load_guardian(gid, size=(gsz, gsz), feather=45)
        if g:
            base.paste(g, (gx, gy), g)

    # Left text panel gradient overlay (seamless transition)
    overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    ov_draw = ImageDraw.Draw(overlay)
    for x in range(0, 950):
        opacity = int(255 * (1 - (x / 950)**1.2))
        ov_draw.line([(x, 0), (x, height)], fill=(6, 8, 12, opacity))
    base = Image.alpha_composite(base, overlay)
    draw = ImageDraw.Draw(base)

    # Typography
    try:
        f_subhead = ImageFont.truetype(FONT_BODY, 15)
        f_title = ImageFont.truetype(FONT_HEADING, 44)
        f_tagline = ImageFont.truetype(FONT_BODY, 18)
        f_desc = ImageFont.truetype(FONT_REGULAR, 15)
        f_badge = ImageFont.truetype(FONT_BODY, 14)

        # Header tag
        draw.text((70, 70), "CELESTIAL GENESIS ARCHIVES • ROBINHOOD CHAIN", fill=(212, 175, 55), font=f_subhead)

        # Title
        draw.text((70, 105), "MYTHICAL BEASTS", fill=(255, 235, 180), font=f_title)
        draw.text((70, 160), "& GUARDIANS", fill=(212, 175, 55), font=f_title)

        # Tagline
        draw.text((70, 245), "2,222 Sovereign Celestial Familiars • 5 Primordial Elements", fill=(220, 225, 235), font=f_tagline)
        draw.text((70, 275), "On-Chain Elemental DNA • OpenSea Blue-Chip Standards", fill=(145, 155, 170), font=f_desc)

        # Pill badges (clean ASCII, zero emoji boxes)
        pills = [
            ("MINT: 0.0005 ETH", 70),
            ("SUPPLY: 2,222", 240),
            ("STATUS: LIVE", 380),
            ("OPENSEA READY", 515)
        ]
        for label, px in pills:
            box_w = len(label) * 9 + 24
            draw.rounded_rectangle([px, 340, px + box_w, 380], radius=10, fill=(15, 20, 30, 230), outline=(212, 175, 55, 180), width=1)
            draw.text((px + 12, 352), label, fill=(255, 215, 0), font=f_badge)

    except Exception as e:
        print("Font error:", e)

    # Golden luxury border frame
    draw.rectangle([0, 0, width-1, height-1], outline=(212, 175, 55, 220), width=2)
    draw.rectangle([6, 6, width-7, height-7], outline=(212, 175, 55, 70), width=1)

    out_path = os.path.join(OUT_DIR, "X_BANNER_1500x500.png")
    base.convert("RGB").save(out_path, quality=95)
    print(f"[+] Created: {out_path}")

def create_opensea_banner():
    """1500x500 / 1400x350 OpenSea Collection Storefront Banner"""
    width, height = 1500, 500
    base = Image.new("RGBA", (width, height), (7, 9, 13, 255))
    draw = ImageDraw.Draw(base)

    # 5 Guardians arranged symmetrically with heavy feathered blending
    positions = [
        (1, 140, 360),   # Black Tortoise
        (5, 410, 400),   # White Tiger
        (4, 750, 440),   # Azure Dragon (center hero)
        (3, 1090, 400),  # Vermilion Bird
        (8, 1360, 360)   # Nine-Tailed Fox
    ]
    for gid, cx, sz in positions:
        g = load_guardian(gid, size=(sz, sz), feather=50)
        if g:
            base.paste(g, (cx - sz//2, 30), g)

    # Bottom dark gradient vignette for readable text
    bottom_overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    bo_draw = ImageDraw.Draw(bottom_overlay)
    for y in range(240, height):
        alpha = int(245 * ((y - 240) / 260)**1.2)
        bo_draw.line([(0, y), (width, y)], fill=(7, 9, 13, alpha))
    base = Image.alpha_composite(base, bottom_overlay)
    draw = ImageDraw.Draw(base)

    try:
        f_title = ImageFont.truetype(FONT_HEADING, 38)
        f_sub = ImageFont.truetype(FONT_BODY, 15)
        f_stats = ImageFont.truetype(FONT_BODY, 13)

        # Center Title & Specs
        draw.text((750, 350), "MYTHICAL BEASTS & GUARDIANS", fill=(255, 220, 120), font=f_title, anchor="mm")
        draw.text((750, 395), "2,222 SOVEREIGN CELESTIAL FAMILIARS • ROBINHOOD CHAIN MAINNET", fill=(212, 175, 55), font=f_sub, anchor="mm")
        draw.text((750, 430), "SUPPLY: 2,222  •  MINT: 0.0005 ETH  •  ROYALTIES: 5% (ERC-2981)", fill=(160, 170, 185), font=f_stats, anchor="mm")
    except Exception as e:
        print("Font error:", e)

    draw.rectangle([0, 0, width-1, height-1], outline=(212, 175, 55, 180), width=2)
    draw.rectangle([5, 5, width-6, height-6], outline=(212, 175, 55, 60), width=1)

    out_path = os.path.join(OUT_DIR, "OPENSEA_BANNER_1500x500.png")
    base.convert("RGB").save(out_path, quality=95)
    print(f"[+] Created: {out_path}")

if __name__ == "__main__":
    print("Re-generating perfected social assets...")
    create_x_pfp()
    create_opensea_pfp()
    create_x_banner()
    create_opensea_banner()
    print("Done! All social assets perfected.")
