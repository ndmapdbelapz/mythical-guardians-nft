"""
update_website_art.py
Regenerates all web preview assets in web/assets/beasts/ and web/assets/companions/
using the high-art generative engine with 100% PURE ART (zero text, zero badges, zero overlays).
"""

import os
import sys

SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPTS_DIR)
sys.path.insert(0, SCRIPTS_DIR)

from generate_full_collection_2222 import (
    ARCHETYPES,
    ELEMENT_PALETTES,
    REALMS,
    HALOS,
    AURAS,
    BODY_FINISHES,
    EYES,
    HEADWEAR,
    RELICS,
    FOREHEAD_MARKS,
    generate_svg_markup
)

BEASTS_DIR = os.path.join(PROJECT_ROOT, "web", "assets", "beasts")
COMPANIONS_DIR = os.path.join(PROJECT_ROOT, "web", "assets", "companions")

os.makedirs(BEASTS_DIR, exist_ok=True)
os.makedirs(COMPANIONS_DIR, exist_ok=True)

ELEMENTS = ["Fire", "Water", "Earth", "Air", "Void"]

print("Updating web/assets/beasts/ with 100% Pure High-Art SVGs...")

# Generate high-art SVG for every Archetype x Element
for arch in ARCHETYPES:
    arch_code = arch["code"]
    for el_name in ELEMENTS:
        palette = ELEMENT_PALETTES[el_name][0] # Primary signature harmony
        stance = arch["stances"][0] # Primary iconic stance
        realm = REALMS[0]
        halo = HALOS[0]
        aura = AURAS[0]
        body = BODY_FINISHES[0]
        eye = EYES[0]
        hw = HEADWEAR[0]
        relic = RELICS[0]
        mark = FOREHEAD_MARKS[0]

        traits = {
            "archetype": arch,
            "stance": stance,
            "element": el_name,
            "palette": palette,
            "realm": realm,
            "halo": halo,
            "aura": aura,
            "body": body,
            "eye": eye,
            "headwear": hw,
            "relic": relic,
            "forehead_mark": mark
        }

        svg_content = generate_svg_markup(traits, 0)
        file_name = f"{arch_code}_{el_name}.svg"
        out_path = os.path.join(BEASTS_DIR, file_name)
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(svg_content)
        print(f"  + Generated {file_name} (Pure Art)")

# Generate Void Fiend Boss SVG for Lore Battle
boss_arch = ARCHETYPES[6] # Garuda
boss_palette = ELEMENT_PALETTES["Void"][0]
boss_traits = {
    "archetype": boss_arch,
    "stance": boss_arch["stances"][1],
    "element": "Void",
    "palette": boss_palette,
    "realm": REALMS[5], # Cosmic Vortex
    "halo": HALOS[7], # Void Singularity
    "aura": AURAS[8], # Void Fissures
    "body": BODY_FINISHES[2], # Obsidian Polished Armor
    "eye": EYES[4], # Amethyst Void Spiral
    "headwear": HEADWEAR[8], # Vajra Thunder Spikes
    "relic": RELICS[7], # Seven-Treasure Vajra Scepter
    "forehead_mark": FOREHEAD_MARKS[7] # Void Singularity Bindu
}
boss_svg = generate_svg_markup(boss_traits, 9999)
with open(os.path.join(BEASTS_DIR, "VoidFiend_Boss.svg"), "w", encoding="utf-8") as f:
    f.write(boss_svg)
print("  + Generated VoidFiend_Boss.svg")

# Generate 6 Pure Art Celestial Companions (Zero text, zero banners)
print("Updating web/assets/companions/ with Pure Art...")
companion_colors = [
    {"bg1": "#4B1173", "bg2": "#13031E", "ring": "#E5B8F4", "core": "#AF52DE", "orb": "#BF5AF2"}, # Void
    {"bg1": "#731408", "bg2": "#1E0503", "ring": "#FFD60A", "core": "#FF3B30", "orb": "#FF9500"}, # Fire
    {"bg1": "#052F5F", "bg2": "#021226", "ring": "#64D2FF", "core": "#007AFF", "orb": "#5AC8FA"}, # Water
    {"bg1": "#0A3B18", "bg2": "#031709", "ring": "#A8E6CF", "core": "#34C759", "orb": "#30D158"}, # Earth
    {"bg1": "#123F4E", "bg2": "#051A21", "ring": "#70E4EF", "core": "#00C7BE", "orb": "#E0F7FA"}, # Air
    {"bg1": "#5E3A00", "bg2": "#241600", "ring": "#FFE57F", "core": "#FFD700", "orb": "#FFA000"}, # Starlight
]

for i in range(1, 7):
    c = companion_colors[i - 1]
    comp_svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    <radialGradient id="comp-bg-{i}" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="{c['bg1']}"/>
      <stop offset="60%" stop-color="{c['bg2']}"/>
      <stop offset="100%" stop-color="#050508"/>
    </radialGradient>
    <filter id="comp-glow-{i}" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="14" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Deep Sacred Space Canvas -->
  <rect width="500" height="500" fill="url(#comp-bg-{i})"/>

  <!-- Celestial Constellation Dust -->
  <g opacity="0.4" fill="#FFFFFF">
    <circle cx="90" cy="80" r="1.5"/>
    <circle cx="410" cy="110" r="2"/>
    <circle cx="70" cy="390" r="1.5"/>
    <circle cx="420" cy="410" r="2.5"/>
    <circle cx="130" cy="230" r="1"/>
    <circle cx="370" cy="260" r="1.5"/>
  </g>

  <!-- Sacred Mandalas of Awakening -->
  <circle cx="250" cy="250" r="210" stroke="{c['ring']}" stroke-width="1.5" stroke-dasharray="10 8" fill="none" opacity="0.6"/>
  <circle cx="250" cy="250" r="185" stroke="{c['orb']}" stroke-width="2" fill="none" opacity="0.75"/>
  <circle cx="250" cy="250" r="160" stroke="{c['ring']}" stroke-width="1" stroke-dasharray="4 4" fill="none" opacity="0.5"/>

  <!-- Rotating Sacred Trigram Points -->
  <g stroke="{c['ring']}" stroke-width="1.5" opacity="0.7">
    <line x1="250" y1="35" x2="250" y2="55"/>
    <line x1="250" y1="445" x2="250" y2="465"/>
    <line x1="35" y1="250" x2="55" y2="250"/>
    <line x1="445" y1="250" x2="465" y2="250"/>
  </g>

  <!-- Divine Familiar Core Entity -->
  <g filter="url(#comp-glow-{i})">
    <circle cx="250" cy="250" r="75" fill="{c['core']}" opacity="0.85"/>
    <circle cx="250" cy="250" r="50" fill="{c['ring']}" opacity="0.9"/>
    <circle cx="250" cy="250" r="22" fill="#FFFFFF"/>

    <!-- Sacred Triquetra Crest -->
    <path d="M 250 185 Q 285 240 250 295 Q 215 240 250 185 Z" fill="{c['orb']}" opacity="0.8"/>

    <!-- Orbital Spirit Wisps -->
    <circle cx="170" cy="190" r="14" fill="{c['orb']}"/>
    <circle cx="170" cy="190" r="6" fill="#FFF"/>
    <circle cx="330" cy="190" r="14" fill="{c['orb']}"/>
    <circle cx="330" cy="190" r="6" fill="#FFF"/>
    <circle cx="250" cy="340" r="18" fill="{c['ring']}"/>
    <circle cx="250" cy="340" r="8" fill="#FFF"/>

    <!-- Celestial Crown Petals -->
    <polygon points="250,130 264,155 236,155" fill="{c['ring']}"/>
    <polygon points="190,150 208,170 182,175" fill="{c['ring']}"/>
    <polygon points="310,150 318,175 292,170" fill="{c['ring']}"/>
  </g>
</svg>"""
    out_c_path = os.path.join(COMPANIONS_DIR, f"companion_{i}.svg")
    with open(out_c_path, "w", encoding="utf-8") as f:
        f.write(comp_svg)
    print(f"  + Generated companion_{i}.svg (Pure Art, Zero Text)")

print("\nSUCCESS: All website art assets regenerated with 100% Pure Art!")
