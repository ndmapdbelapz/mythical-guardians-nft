"""
generate_collection.py
Generates 100 sample OpenSea-compliant JSON metadata records and sample token database
for Mythical Beasts & Guardians with statistical rarity calculation.
"""

import os
import json
import random

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.join(BASE_DIR, "..")
METADATA_JSON_DIR = os.path.join(PROJECT_DIR, "metadata", "json")
WEB_DATA_PATH = os.path.join(PROJECT_DIR, "web", "assets", "sample_tokens.json")
STATS_PATH = os.path.join(PROJECT_DIR, "metadata", "collection_stats.json")

os.makedirs(METADATA_JSON_DIR, exist_ok=True)
os.makedirs(os.path.dirname(WEB_DATA_PATH), exist_ok=True)

BEAST_ARCHETYPES = [
    {"name": "Azure Dragon", "code": "AzureDragon", "weight": 18, "title": "Sovereign of the Eastern Storms"},
    {"name": "Vermilion Bird", "code": "VermilionBird", "weight": 18, "title": "Immortal Solar Phoenix"},
    {"name": "White Tiger", "code": "WhiteTiger", "weight": 18, "title": "Celestial Arbiter of War & Metal"},
    {"name": "Black Tortoise", "code": "BlackTortoise", "weight": 18, "title": "Abyssal Sentinel of Guixu"},
    {"name": "Nine-Tailed Fox", "code": "NineTailedFox", "weight": 14, "title": "Spirit Enchantress of Kitsune-bi"},
    {"name": "Qilin", "code": "Qilin", "weight": 10, "title": "Auspicious Chimera of Pure Void"},
    {"name": "Garuda", "code": "Garuda", "weight": 4, "title": "Sun-Winged Vanquisher of Serpents"}
]

ELEMENTS = [
    {"name": "Fire", "weight": 22, "affinity": "Aggressive Burst / Solar Cleansing", "kanji": "火"},
    {"name": "Water", "weight": 22, "affinity": "Adaptive Flow / Glacial Ward", "kanji": "水"},
    {"name": "Earth", "weight": 22, "affinity": "Unyielding Stance / Petrification", "kanji": "地"},
    {"name": "Air", "weight": 22, "affinity": "Swift Evasion / Gale Slashes", "kanji": "风"},
    {"name": "Void", "weight": 12, "affinity": "Cosmic Transience / Spatial Tear", "kanji": "空"}
]

REALMS = [
    {"name": "Kunlun Sacred Peaks", "weight": 25},
    {"name": "Mount Penglai Immortal Isle", "weight": 20},
    {"name": "Abyssal Trench of Guixu", "weight": 20},
    {"name": "Floating Bamboo Sanctuary", "weight": 15},
    {"name": "Western Shifting Sands", "weight": 12},
    {"name": "Hundun Void Rift", "weight": 8}
]

AURAS = [
    {"name": "Celestial Thunderclap", "weight": 20},
    {"name": "Blazing Solar Cinders", "weight": 20},
    {"name": "Bioluminescent Abyssal Mists", "weight": 20},
    {"name": "Quaking Geo-Spire", "weight": 18},
    {"name": "Floating Kitsune-bi Wisps", "weight": 14},
    {"name": "Astral Nebula Singularity", "weight": 8}
]

RELICS = [
    {"name": "Imperial Jade Dragon Seal", "weight": 15},
    {"name": "Nine-Star Bronze Scrying Mirror", "weight": 18},
    {"name": "Kunlun Primordial Dagger", "weight": 16},
    {"name": "Soul-Calling Lotus Bell", "weight": 18},
    {"name": "Laozi Celestial Thunder Gourd", "weight": 14},
    {"name": "Vermilion Feather War Fan", "weight": 12},
    {"name": "Seven-Jeweled Void Vajra", "weight": 7}
]

EYES = [
    {"name": "Luminous Jade Gaze", "weight": 25},
    {"name": "Molten Amber Flame", "weight": 25},
    {"name": "Glacial Ocean Sapphire", "weight": 22},
    {"name": "Deep Obsidian Void", "weight": 18},
    {"name": "Starlight Amethyst", "weight": 10}
]

def weighted_choice(items):
    total = sum(item["weight"] for item in items)
    r = random.uniform(0, total)
    upto = 0
    for item in items:
        if upto + item["weight"] >= r:
            return item
        upto += item["weight"]
    return items[-1]

def determine_rarity_tier(score):
    if score >= 90:
        return "Mythic"
    elif score >= 80:
        return "Legendary"
    elif score >= 70:
        return "Epic"
    else:
        return "Rare"

def generate_tokens(count=100):
    random.seed(42) # Deterministic for clean verification
    tokens = []

    print(f"Generating {count} Mythical Beasts token metadata records...")

    for token_id in range(1, count + 1):
        beast = weighted_choice(BEAST_ARCHETYPES)
        element = weighted_choice(ELEMENTS)
        realm = weighted_choice(REALMS)
        aura = weighted_choice(AURAS)
        relic = weighted_choice(RELICS)
        eye = weighted_choice(EYES)

        # Calculate combat and power ratings
        power_rating = random.randint(68, 98)
        mastery = random.randint(1, 5)

        # Base score bonus for rare elements (Void) and beast (Garuda, Qilin)
        rarity_score = 50 + (15 if element["name"] == "Void" else 0) + (15 if beast["code"] in ["Garuda", "Qilin"] else 0) + (power_rating - 68) // 3
        rarity_tier = determine_rarity_tier(rarity_score)

        image_filename = f"{beast['code']}_{element['name']}.svg"
        image_url = f"assets/beasts/{image_filename}"

        lore_description = (
            f"Awakened from the {realm['name']}, this {element['name']}-attuned {beast['name']} "
            f"embodies {beast['title']}. Bearing the sacred {relic['name']} and surrounded by {aura['name']}, "
            f"it stands sentinel across the mortal and spirit thresholds."
        )

        metadata = {
            "name": f"{beast['name']} #{token_id:04d}",
            "description": lore_description,
            "image": image_url,
            "external_url": f"https://mythicalbeasts.art/guardians/{token_id}",
            "edition": token_id,
            "attributes": [
                {"trait_type": "Archetype", "value": beast["name"]},
                {"trait_type": "Element", "value": element["name"]},
                {"trait_type": "Elemental Kanji", "value": element["kanji"]},
                {"trait_type": "Affinity Style", "value": element["affinity"]},
                {"trait_type": "Sacred Realm", "value": realm["name"]},
                {"trait_type": "Aura Phenomenon", "value": aura["name"]},
                {"trait_type": "Relic", "value": relic["name"]},
                {"trait_type": "Eye Brilliance", "value": eye["name"]},
                {"trait_type": "Rarity Tier", "value": rarity_tier},
                {"trait_type": "Combat Power", "value": power_rating, "max_value": 100},
                {"trait_type": "Affinity Mastery", "value": mastery, "max_value": 5}
            ],
            "properties": {
                "beast_code": beast["code"],
                "element_name": element["name"],
                "rarity_score": rarity_score,
                "power_rating": power_rating,
                "mastery_stars": mastery
            }
        }

        # Save single token JSON
        token_json_path = os.path.join(METADATA_JSON_DIR, f"{token_id}.json")
        with open(token_json_path, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)

        tokens.append(metadata)

    # Save web bundle
    with open(WEB_DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(tokens, f, indent=2, ensure_ascii=False)

    # Compute statistics
    element_counts = {}
    beast_counts = {}
    tier_counts = {}

    for t in tokens:
        el = t["properties"]["element_name"]
        b = t["properties"]["beast_code"]
        tr = next(attr["value"] for attr in t["attributes"] if attr["trait_type"] == "Rarity Tier")
        element_counts[el] = element_counts.get(el, 0) + 1
        beast_counts[b] = beast_counts.get(b, 0) + 1
        tier_counts[tr] = tier_counts.get(tr, 0) + 1

    stats = {
        "total_tokens": count,
        "element_distribution": element_counts,
        "beast_distribution": beast_counts,
        "tier_distribution": tier_counts
    }

    with open(STATS_PATH, "w", encoding="utf-8") as f:
        json.dump(stats, f, indent=2)

    print(f"Successfully generated {count} metadata files in {METADATA_JSON_DIR}")
    print(f"Exported web dataset to {WEB_DATA_PATH}")
    print(f"Collection statistics: {stats}")

if __name__ == "__main__":
    generate_tokens(100)
