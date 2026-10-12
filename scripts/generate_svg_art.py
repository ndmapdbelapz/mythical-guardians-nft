"""
generate_svg_art.py
Generates exquisite, high-art vector SVG visuals for Mythical Beasts & Guardians
featuring custom elemental color palettes, celestial runes, intricate silhouettes,
and dynamic particle glows.
"""

import os
import math
import random

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "web", "assets", "beasts")
COMPANIONS_DIR = os.path.join(os.path.dirname(__file__), "..", "web", "assets", "companions")
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(COMPANIONS_DIR, exist_ok=True)

ELEMENT_THEMES = {
    "Fire": {
        "primary": "#FF3B30",
        "secondary": "#FF9500",
        "glow": "#FFD60A",
        "dark": "#590D08",
        "bg_gradient": ("#1E0503", "#3B0A06", "#731408"),
        "kanji": "火",
        "symbol_label": "FIRE"
    },
    "Water": {
        "primary": "#007AFF",
        "secondary": "#5AC8FA",
        "glow": "#64D2FF",
        "dark": "#03284B",
        "bg_gradient": ("#020D1A", "#041E38", "#083B6F"),
        "kanji": "水",
        "symbol_label": "WATER"
    },
    "Earth": {
        "primary": "#34C759",
        "secondary": "#AF52DE",
        "glow": "#A8E063",
        "dark": "#1B3B18",
        "bg_gradient": ("#0F1E0D", "#1C3617", "#2D5425"),
        "kanji": "地",
        "symbol_label": "EARTH"
    },
    "Air": {
        "primary": "#30D158",
        "secondary": "#70E4EF",
        "glow": "#E0F7FA",
        "dark": "#0B3C49",
        "bg_gradient": ("#071B20", "#0D333D", "#155263"),
        "kanji": "风",
        "symbol_label": "AIR"
    },
    "Void": {
        "primary": "#AF52DE",
        "secondary": "#BF5AF2",
        "glow": "#E5B8F4",
        "dark": "#2B0B3A",
        "bg_gradient": ("#13031E", "#27083D", "#4B1173"),
        "kanji": "空",
        "symbol_label": "VOID"
    }
}

def create_elemental_ring(el):
    theme = ELEMENT_THEMES[el]
    return f"""
    <!-- Elemental Runic Ring -->
    <circle cx="250" cy="250" r="225" stroke="{theme['primary']}" stroke-width="2" stroke-opacity="0.4" fill="none" stroke-dasharray="8 6"/>
    <circle cx="250" cy="250" r="215" stroke="{theme['glow']}" stroke-width="1.5" stroke-opacity="0.6" fill="none"/>
    <circle cx="250" cy="250" r="195" stroke="{theme['secondary']}" stroke-width="1" stroke-opacity="0.3" fill="none" stroke-dasharray="14 10"/>
    
    <!-- Quadrant Corner Runes -->
    <polygon points="250,22 256,38 244,38" fill="{theme['glow']}" opacity="0.8"/>
    <polygon points="250,478 256,462 244,462" fill="{theme['glow']}" opacity="0.8"/>
    <polygon points="22,250 38,256 38,244" fill="{theme['glow']}" opacity="0.8"/>
    <polygon points="478,250 462,256 462,244" fill="{theme['glow']}" opacity="0.8"/>
    
    <!-- Sacred Seal Glyph (English Only) -->
    <rect x="200" y="30" width="100" height="28" rx="6" fill="{theme['dark']}" stroke="{theme['glow']}" stroke-width="1.5" opacity="0.9"/>
    <text x="250" y="49" font-family="'Cinzel', serif" font-size="14" font-weight="800" fill="{theme['glow']}" letter-spacing="3" text-anchor="middle">{theme['symbol_label']}</text>
    """

def get_beast_silhouette(beast_type, theme):
    p = theme['primary']
    s = theme['secondary']
    g = theme['glow']
    d = theme['dark']

    if beast_type == "AzureDragon":
        # Celestial Dragon coils with dragon horns, whiskers and pearl
        return f"""
        <!-- Azure Dragon - Qinglong -->
        <g id="dragon-coils" filter="url(#glow)">
            <!-- Main Serpentine Body -->
            <path d="M 120 380 C 80 280, 160 160, 260 140 C 360 120, 420 220, 370 300 C 330 360, 220 370, 180 320 C 150 280, 170 210, 240 190 C 300 170, 350 200, 360 250" 
                  fill="none" stroke="{p}" stroke-width="32" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>
            <path d="M 120 380 C 80 280, 160 160, 260 140 C 360 120, 420 220, 370 300 C 330 360, 220 370, 180 320 C 150 280, 170 210, 240 190 C 300 170, 350 200, 360 250" 
                  fill="none" stroke="{s}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>
            <!-- Dorsal Spines -->
            <path d="M 170 160 L 175 140 L 190 155 L 205 135 L 220 150 L 245 130 L 260 148 L 290 128 L 305 145 L 340 128 L 350 152" 
                  stroke="{g}" stroke-width="5" fill="none" opacity="0.9"/>
            <!-- Dragon Head -->
            <path d="M 230 180 L 290 160 L 320 185 L 300 215 L 250 210 Z" fill="{p}"/>
            <!-- Antlers / Horns -->
            <path d="M 270 160 Q 295 110 330 95 M 300 135 Q 330 130 345 120" stroke="{g}" stroke-width="6" stroke-linecap="round" fill="none"/>
            <path d="M 255 165 Q 260 125 285 105" stroke="{s}" stroke-width="5" stroke-linecap="round" fill="none"/>
            <!-- Whiskers -->
            <path d="M 315 185 Q 380 180 410 220 M 310 200 Q 370 210 395 260" stroke="{g}" stroke-width="3.5" fill="none"/>
            <!-- Glowing Dragon Eye -->
            <circle cx="285" cy="180" r="7" fill="{g}" filter="url(#bright-glow)"/>
            <circle cx="285" cy="180" r="3" fill="#FFF"/>
            <!-- Flaming Dragon Pearl Orb -->
            <circle cx="150" cy="330" r="28" fill="url(#orb-grad)" filter="url(#glow)"/>
            <circle cx="150" cy="330" r="14" fill="{g}"/>
            <!-- Claws -->
            <path d="M 130 250 L 110 235 M 130 250 L 105 250 M 130 250 L 115 268" stroke="{g}" stroke-width="5" stroke-linecap="round"/>
        </g>
        """

    elif beast_type == "NineTailedFox":
        # Enchanting Kitsune / Huli Jing silhouette with 9 fan-shaped glowing ethereal tails and mask
        tails_svg = ""
        angles = [-65, -50, -35, -20, 0, 20, 35, 50, 65]
        for idx, ang in enumerate(angles):
            rad = math.radians(ang)
            end_x = 250 + math.sin(rad) * 190
            end_y = 260 - math.cos(rad) * 170
            ctrl_x = 250 + math.sin(rad * 0.7) * 230
            ctrl_y = 270 - math.cos(rad * 0.7) * 100
            tails_svg += f"""
            <path d="M 250 330 Q {ctrl_x:.1f} {ctrl_y:.1f} {end_x:.1f} {end_y:.1f} Q {ctrl_x + 20:.1f} {ctrl_y + 30:.1f} 250 330" 
                  fill="{p}" opacity="0.6" stroke="{g}" stroke-width="2.5"/>
            <!-- Ethereal Soul Orb at tip -->
            <circle cx="{end_x:.1f}" cy="{end_y:.1f}" r="6" fill="{g}" filter="url(#bright-glow)"/>
            """

        return f"""
        <!-- Nine-Tailed Fox - Kitsune / Huli Jing -->
        <g id="kitsune-beast">
            <!-- 9 Radiant Tails -->
            {tails_svg}
            <!-- Graceful Fox Body -->
            <path d="M 215 380 Q 220 290 245 250 Q 255 240 255 230 Q 245 220 250 200 L 260 200 Q 265 220 255 230 Q 280 290 285 380 Z" fill="{s}" opacity="0.95"/>
            <!-- Fox Face & Mask -->
            <path d="M 250 170 L 230 140 L 238 185 L 250 215 L 262 185 L 270 140 Z" fill="{g}"/>
            <!-- Fox Ears -->
            <polygon points="230,150 220,105 242,135" fill="{p}" stroke="{g}" stroke-width="2"/>
            <polygon points="270,150 280,105 258,135" fill="{p}" stroke="{g}" stroke-width="2"/>
            <polygon points="230,140 226,118 238,132" fill="{d}"/>
            <polygon points="270,140 274,118 262,132" fill="{d}"/>
            <!-- Ceremonial Red Face Markings -->
            <path d="M 238 175 Q 244 185 242 195 M 262 175 Q 256 185 258 195" stroke="{p}" stroke-width="3" fill="none"/>
            <!-- Eyes -->
            <ellipse cx="242" cy="175" rx="4" ry="2" fill="{d}"/>
            <ellipse cx="258" cy="175" rx="4" ry="2" fill="{d}"/>
            <!-- Floating Foxfire (Kitsune-bi) -->
            <circle cx="160" cy="220" r="14" fill="{g}" opacity="0.8" filter="url(#bright-glow)"/>
            <circle cx="340" cy="210" r="16" fill="{g}" opacity="0.8" filter="url(#bright-glow)"/>
            <circle cx="250" cy="120" r="9" fill="{s}" opacity="0.9" filter="url(#glow)"/>
        </g>
        """

    elif beast_type == "VermilionBird":
        # Zhuque / Phoenix - Celestial flaming wings, crown crest, tail streamers
        return f"""
        <!-- Vermilion Bird - Zhuque -->
        <g id="zhuque-phoenix" filter="url(#glow)">
            <!-- Magnificent Left Wing -->
            <path d="M 240 260 C 170 240, 110 170, 70 110 C 110 150, 140 210, 180 230 C 130 190, 90 140, 60 70 C 110 130, 170 190, 220 240" 
                  fill="{p}" stroke="{g}" stroke-width="3" opacity="0.9"/>
            <!-- Magnificent Right Wing -->
            <path d="M 260 260 C 330 240, 390 170, 430 110 C 390 150, 360 210, 320 230 C 370 190, 410 140, 440 70 C 390 130, 330 190, 280 240" 
                  fill="{p}" stroke="{g}" stroke-width="3" opacity="0.9"/>
            <!-- Inner Wing Radiant Feathers -->
            <path d="M 230 250 Q 140 200 110 140 Q 170 210 230 250" fill="{s}" opacity="0.8"/>
            <path d="M 270 250 Q 360 200 390 140 Q 330 210 270 250" fill="{s}" opacity="0.8"/>
            <!-- Torso & Plumage -->
            <ellipse cx="250" cy="270" rx="30" ry="50" fill="{s}"/>
            <!-- Head & Sharp Beak -->
            <circle cx="250" cy="195" r="22" fill="{p}"/>
            <polygon points="250,185 275,195 250,205" fill="{g}"/>
            <!-- Crown Feathers -->
            <path d="M 245 175 Q 230 120 210 95 Q 235 125 248 175" fill="{g}"/>
            <path d="M 250 173 Q 250 110 250 80 Q 255 110 252 173" fill="{g}"/>
            <path d="M 255 175 Q 270 120 290 95 Q 265 125 252 175" fill="{g}"/>
            <!-- Majestic Tail Ribbon Streamers -->
            <path d="M 240 320 Q 210 380 180 430 Q 220 400 245 330" fill="{p}" stroke="{g}" stroke-width="2"/>
            <path d="M 250 320 Q 250 390 250 450 Q 255 400 252 330" fill="{s}" stroke="{g}" stroke-width="2"/>
            <path d="M 260 320 Q 290 380 320 430 Q 280 400 255 330" fill="{p}" stroke="{g}" stroke-width="2"/>
            <!-- Phoenix Eye -->
            <circle cx="258" cy="192" r="4" fill="{g}" filter="url(#bright-glow)"/>
        </g>
        """

    elif beast_type == "WhiteTiger":
        # Baihu - Fierce celestial tiger with war runes, fangs, and thunderous claws
        return f"""
        <!-- White Tiger - Baihu -->
        <g id="baihu-tiger">
            <!-- Tiger Head Silhouette -->
            <path d="M 180 230 Q 150 170 180 140 Q 210 130 220 160 Q 250 150 280 160 Q 290 130 320 140 Q 350 170 320 230 Q 340 280 320 330 Q 250 360 180 330 Q 160 280 180 230 Z" 
                  fill="{d}" stroke="{p}" stroke-width="4"/>
            <!-- Tiger Ears -->
            <polygon points="180,140 195,110 215,145" fill="{p}" stroke="{g}" stroke-width="2"/>
            <polygon points="320,140 305,110 285,145" fill="{p}" stroke="{g}" stroke-width="2"/>
            <!-- Forehead King Glyph '王' (Wang) -->
            <g transform="translate(235, 175)" stroke="{g}" stroke-width="3.5" stroke-linecap="round">
                <line x1="0" y1="0" x2="30" y2="0"/>
                <line x1="5" y1="12" x2="25" y2="12"/>
                <line x1="0" y1="24" x2="30" y2="24"/>
                <line x1="15" y1="0" x2="15" y2="24"/>
            </g>
            <!-- Ferocious Eyes -->
            <polygon points="205,215 230,225 210,232" fill="{g}" filter="url(#bright-glow)"/>
            <polygon points="295,215 270,225 290,232" fill="{g}" filter="url(#bright-glow)"/>
            <!-- Snout & Fangs -->
            <ellipse cx="250" cy="270" rx="28" ry="20" fill="{s}" opacity="0.6"/>
            <polygon points="244,260 256,260 250,270" fill="{d}"/>
            <polygon points="230,285 238,285 234,305" fill="#FFF"/>
            <polygon points="270,285 262,285 266,305" fill="#FFF"/>
            <!-- Tiger War Stripes -->
            <path d="M 175 220 Q 200 225 210 235 M 325 220 Q 300 225 290 235" stroke="{p}" stroke-width="4" stroke-linecap="round"/>
            <path d="M 170 260 Q 200 265 215 270 M 330 260 Q 300 265 285 270" stroke="{p}" stroke-width="4" stroke-linecap="round"/>
            <path d="M 185 295 Q 210 295 225 295 M 315 295 Q 290 295 275 295" stroke="{p}" stroke-width="4" stroke-linecap="round"/>
            <!-- War Talons -->
            <path d="M 170 360 L 150 410 M 190 365 L 180 420 M 210 360 L 210 415" stroke="{g}" stroke-width="5" stroke-linecap="round"/>
            <path d="M 330 360 L 350 410 M 310 365 L 320 420 M 290 360 L 290 415" stroke="{g}" stroke-width="5" stroke-linecap="round"/>
        </g>
        """

    elif beast_type == "BlackTortoise":
        # Xuanwu - Armored tortoise entwined with celestial abyss serpent
        return f"""
        <!-- Black Tortoise - Xuanwu -->
        <g id="xuanwu-beast">
            <!-- Ancient Tortoise Shell Base -->
            <ellipse cx="250" cy="290" rx="100" ry="75" fill="{d}" stroke="{p}" stroke-width="4"/>
            <!-- Hexagonal Shell Runes -->
            <polygon points="250,245 280,260 280,295 250,310 220,295 220,260" fill="none" stroke="{g}" stroke-width="2.5"/>
            <polygon points="250,315 280,330 280,355 250,370 220,355 220,330" fill="none" stroke="{s}" stroke-width="2"/>
            <polygon points="180,270 210,285 210,315 180,330 155,315 155,285" fill="none" stroke="{s}" stroke-width="2"/>
            <polygon points="320,270 345,285 345,315 320,330 290,315 290,285" fill="none" stroke="{s}" stroke-width="2"/>
            <!-- Tortoise Head & Armored Feet -->
            <path d="M 235 225 Q 235 170 250 170 Q 265 170 265 225 Z" fill="{p}"/>
            <circle cx="245" cy="180" r="3" fill="{g}"/>
            <circle cx="255" cy="180" r="3" fill="{g}"/>
            <!-- Entwined Celestial Serpent -->
            <path d="M 160 330 C 130 260, 200 180, 290 170 C 370 160, 380 260, 310 320 C 260 360, 190 350, 160 310" 
                  fill="none" stroke="{g}" stroke-width="12" stroke-linecap="round"/>
            <path d="M 160 330 C 130 260, 200 180, 290 170 C 370 160, 380 260, 310 320 C 260 360, 190 350, 160 310" 
                  fill="none" stroke="{p}" stroke-width="6" stroke-linecap="round"/>
            <!-- Serpent Head Rising Above -->
            <path d="M 290 170 Q 320 140 335 115 Q 355 130 340 150 Z" fill="{g}"/>
            <circle cx="330" cy="128" r="4" fill="#FFF" filter="url(#bright-glow)"/>
        </g>
        """

    elif beast_type == "Qilin":
        # Celestial Kirin - Dragon head, deer body, ox tail, single or dual luminous antler
        return f"""
        <!-- Qilin - Kirin Celestial Chimera -->
        <g id="qilin-beast" filter="url(#glow)">
            <!-- Radiant Celestial Back & Scales -->
            <path d="M 180 360 Q 200 270 230 230 Q 270 220 300 260 Q 330 300 320 370 Z" fill="{d}" stroke="{p}" stroke-width="3"/>
            <!-- Prismatic Sacred Scales -->
            <circle cx="230" cy="280" r="10" fill="{s}" opacity="0.8"/>
            <circle cx="255" cy="270" r="12" fill="{g}" opacity="0.8"/>
            <circle cx="280" cy="285" r="10" fill="{s}" opacity="0.8"/>
            <circle cx="245" cy="310" r="14" fill="{p}" opacity="0.7"/>
            <circle cx="275" cy="315" r="12" fill="{s}" opacity="0.7"/>
            <!-- Regal Arching Neck & Noble Head -->
            <path d="M 230 235 Q 210 180 240 140 L 275 145 Q 285 190 265 235 Z" fill="{p}"/>
            <!-- Single Sacred Horn radiating Starlight -->
            <polygon points="250,140 258,60 266,140" fill="{g}" filter="url(#bright-glow)"/>
            <line x1="258" y1="60" x2="258" y2="140" stroke="#FFF" stroke-width="2"/>
            <!-- Starlight Burst at Horn Tip -->
            <circle cx="258" cy="60" r="12" fill="#FFF" filter="url(#bright-glow)"/>
            <polygon points="258,40 262,56 278,60 262,64 258,80 254,64 238,60 254,56" fill="{g}"/>
            <!-- Celestial Beard & Mane -->
            <path d="M 220 180 Q 180 190 190 220 M 230 200 Q 190 215 200 245" stroke="{g}" stroke-width="4" fill="none"/>
            <!-- Auspicious Lotus Clouds at Base -->
            <path d="M 150 390 Q 190 360 240 380 Q 280 350 330 385 Q 360 410 320 420 Q 240 430 160 415 Z" fill="{s}" opacity="0.5"/>
            <!-- Qilin Eye -->
            <circle cx="255" cy="155" r="5" fill="{g}" filter="url(#bright-glow)"/>
        </g>
        """

    elif beast_type == "Garuda":
        # Garuda - Sun warrior eagle avatar with golden wings and cosmic solar crown
        return f"""
        <!-- Garuda - Celestial Solar Eagle -->
        <g id="garuda-beast" filter="url(#glow)">
            <!-- Solar Disk Background -->
            <circle cx="250" cy="200" r="75" fill="{s}" opacity="0.3"/>
            <!-- Sweeping Golden Wings -->
            <path d="M 230 250 L 90 140 L 150 240 L 80 210 L 170 280 L 100 290 L 220 320 Z" fill="{p}" stroke="{g}" stroke-width="2"/>
            <path d="M 270 250 L 410 140 L 350 240 L 420 210 L 330 280 L 400 290 L 280 320 Z" fill="{p}" stroke="{g}" stroke-width="2"/>
            <!-- Eagle Mask / Face & Crest -->
            <polygon points="250,150 230,190 270,190" fill="{d}" stroke="{g}" stroke-width="3"/>
            <!-- Fierce Beak -->
            <path d="M 240 185 Q 250 220 260 220 Q 260 200 260 185 Z" fill="{g}"/>
            <!-- Eyes -->
            <circle cx="238" cy="175" r="5" fill="{g}" filter="url(#bright-glow)"/>
            <circle cx="262" cy="175" r="5" fill="{g}" filter="url(#bright-glow)"/>
            <!-- Solar Crown Crest -->
            <polygon points="250,150 240,110 250,125 260,110" fill="{g}"/>
            <polygon points="250,125 250,85 255,115" fill="#FFF"/>
        </g>
        """

    return ""

def generate_svg(beast_type, element, token_id=None):
    theme = ELEMENT_THEMES[element]
    bg1, bg2, bg3 = theme['bg_gradient']

    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    <!-- Background Radial Gradient -->
    <radialGradient id="bg" cx="50%" cy="45%" r="75%">
      <stop offset="0%" stop-color="{bg3}"/>
      <stop offset="60%" stop-color="{bg2}"/>
      <stop offset="100%" stop-color="{bg1}"/>
    </radialGradient>
    
    <!-- Glow Filters -->
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    
    <filter id="bright-glow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="14" result="blur2"/>
      <feMerge>
        <feMergeNode in="blur2"/>
        <feMergeNode in="blur2"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    
    <radialGradient id="orb-grad" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stop-color="{theme['glow']}"/>
      <stop offset="50%" stop-color="{theme['secondary']}"/>
      <stop offset="100%" stop-color="{theme['dark']}"/>
    </radialGradient>
  </defs>

  <!-- Deep Canvas Background -->
  <rect width="500" height="500" fill="url(#bg)"/>

  <!-- Celestial Grid / Nebula Particles -->
  <g opacity="0.25">
    <circle cx="80" cy="90" r="1.5" fill="#FFF"/>
    <circle cx="410" cy="120" r="2" fill="{theme['glow']}"/>
    <circle cx="70" cy="400" r="1.5" fill="{theme['glow']}"/>
    <circle cx="430" cy="380" r="2.5" fill="#FFF"/>
    <circle cx="120" cy="220" r="1" fill="#FFF"/>
    <circle cx="380" cy="270" r="1.5" fill="{theme['glow']}"/>
    <circle cx="250" cy="80" r="2" fill="{theme['secondary']}"/>
  </g>

  {create_elemental_ring(element)}

  <!-- Beast Artwork Silhouette -->
  {get_beast_silhouette(beast_type, theme)}

  <!-- Bottom Crest Badge -->
  <g transform="translate(0, 410)">
    <rect x="130" y="20" width="240" height="38" rx="8" fill="{theme['dark']}" stroke="{theme['glow']}" stroke-width="1.5" opacity="0.95"/>
    <text x="250" y="44" font-family="'Cinzel', 'Trajan Pro', serif" font-size="14" font-weight="700" fill="#FFF" letter-spacing="3" text-anchor="middle">
      {beast_type.upper()}
    </text>
  </g>
</svg>"""
    return svg

def generate_companion_svg(name, element, companion_id):
    theme = ELEMENT_THEMES[element]
    bg1, bg2, bg3 = theme['bg_gradient']

    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="{bg3}"/>
      <stop offset="50%" stop-color="{bg2}"/>
      <stop offset="100%" stop-color="{bg1}"/>
    </radialGradient>
    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="12" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <rect width="500" height="500" fill="url(#bg)"/>

  <!-- Halo of Awakening -->
  <circle cx="250" cy="250" r="190" stroke="{theme['glow']}" stroke-width="2" stroke-dasharray="8 6" fill="none" opacity="0.7"/>
  <circle cx="250" cy="250" r="160" stroke="{theme['secondary']}" stroke-width="1.5" fill="none" opacity="0.5"/>

  <!-- Glowing Companion Avatar Center -->
  <g filter="url(#glow)">
    <circle cx="250" cy="240" r="70" fill="{theme['primary']}" opacity="0.8"/>
    <circle cx="250" cy="240" r="45" fill="{theme['glow']}" opacity="0.9"/>
    <circle cx="250" cy="240" r="20" fill="#FFF"/>
    
    <!-- Orbital Familiars -->
    <circle cx="180" cy="180" r="12" fill="{theme['secondary']}"/>
    <circle cx="320" cy="180" r="12" fill="{theme['secondary']}"/>
    <circle cx="250" cy="330" r="16" fill="{theme['glow']}"/>
    <polygon points="250,110 262,130 238,130" fill="{theme['glow']}"/>
  </g>

  <!-- Title Banner -->
  <rect x="80" y="410" width="340" height="42" rx="8" fill="{theme['dark']}" stroke="{theme['glow']}" stroke-width="1.5"/>
  <text x="250" y="437" font-family="'Cinzel', serif" font-size="14" font-weight="700" fill="#FFF" letter-spacing="2" text-anchor="middle">
    COMPANION #{companion_id}: {name.upper()}
  </text>
</svg>"""
    return svg

def main():
    beasts = ["AzureDragon", "VermilionBird", "WhiteTiger", "BlackTortoise", "NineTailedFox", "Qilin", "Garuda"]
    elements = ["Fire", "Water", "Earth", "Air", "Void"]

    print("Generating High-Art Mythical Beast SVG illustrations...")
    count = 0
    for b in beasts:
        for el in elements:
            filename = f"{b}_{el}.svg"
            filepath = os.path.join(OUTPUT_DIR, filename)
            svg_content = generate_svg(b, el)
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(svg_content)
            count += 1
    print(f"Generated {count} beast SVG illustrations in {OUTPUT_DIR}")

    # Generate Companions
    companions = [
        ("Celestial Qilin Hatchling", "Void", 1),
        ("Kitsune Foxfire Orb", "Fire", 2),
        ("Gale Dragonet", "Air", 3),
        ("Tidal Abyss Wyrm", "Water", 4),
        ("Mountain Stone Cub", "Earth", 5),
        ("Prismatic Archon", "Void", 6),
    ]
    for name, el, cid in companions:
        svg_c = generate_companion_svg(name, el, cid)
        cpath = os.path.join(COMPANIONS_DIR, f"companion_{cid}.svg")
        with open(cpath, "w", encoding="utf-8") as f:
            f.write(svg_c)
    print(f"Generated {len(companions)} companion art SVGs in {COMPANIONS_DIR}")

if __name__ == "__main__":
    main()
