# Mythical Beasts & Guardians (神兽绘卷 - Shenshou Chronica)
### Cultural Heritage, Mythology & Folklore • Generative High-Art PFP & Elemental Lore Ecosystem

**Mythical Beasts & Guardians** is an end-to-end Web3 NFT ecosystem and lore gaming platform inspired by centuries of Asian folklore and mythological traditions. The project bridges generative digital art, on-chain elemental game theory, and lore-driven interactive mechanics.

---

## 🌟 1. Project Concept & Folklore Foundation

The collection honors legendary mythical creatures across global and Eastern traditions:

1. **The Four Auspicious Beasts (四象 - Four Symbols)**:
   - **Azure Dragon (青龙 • Qinglong)**: Sovereign of the Eastern heavens, Wood/Air, caller of storms and bearer of the celestial dragon pearl.
   - **Vermilion Bird (朱雀 • Zhuque)**: Immortal solar phoenix of the South, Fire, embodying rebirth and cosmic solar coronal flares.
   - **White Tiger (白虎 • Baihu)**: Fierce celestial arbiter of the West, Earth/Metal, war, and unyielding justice, marked by the forehead imperial '王' (King) glyph.
   - **Black Tortoise & Serpent (玄武 • Xuanwu)**: Ancient armored behemoth entwined with the abyssal serpent of the North, Water, wisdom, and abyssal endurance.
2. **Divine Auspicious Creatures**:
   - **Qilin (麒麟 • Kirin)**: Sacred hooved chimera of pure starlight, Void/Celestial Harmony, bringing peace and boundless fortune.
   - **Nine-Tailed Fox (九尾狐 • Kitsune / Huli Jing / Gumiho)**: Divine trickster and spirit enchantress, Fire/Spirit, wielding nine ethereal tails and dancing Kitsune-bi orbs.
   - **Garuda (迦楼罗)**: Celestial sun-winged warrior eagle, master of the winds and skies.

---

## 🔮 2. The Five Elements & Companion Awakening Utility

Each guardian belongs to one of the **Five Sacred Elements**:
- **Fire (火)**: Solar wrath, explosive burst, purification.
- **Water (水)**: Deep flow, oceanic reflection, shield and adaptation.
- **Earth (地)**: Mountain fortitude, petrification, grounding defense.
- **Air (风)**: Gale swiftness, evasion, wind lacerations.
- **Void (空)**: Astral transcension, critical distortion, spatial tears.

### Pentagonal Altar Convergence
Holders who gather all 5 distinct elements (Fire, Water, Earth, Air, Void) can activate the **Celestial Convergence Ritual** at the Pentagonal Altar (`GuardianSanctum.sol`).
- **Reward**: Mints an exclusive **ERC-1155 Companion Art NFT** (`GuardianCompanions.sol`):
  1. *Celestial Qilin Hatchling* (Void)
  2. *Kitsune Foxfire Orb* (Fire)
  3. *Gale Dragonet* (Air)
  4. *Tidal Abyss Wyrm* (Water)
  5. *Mountain Stone Cub* (Earth)
  6. *Prismatic Archon* (Omni-Convergence)
- **Gameplay Buff**: Unlocks the *Awakened Strike* (True Damage) move in the lore-based web game.

---

## ⚔️ 3. "Trial of the Five Elements" Lore Web Game

An in-browser tactical turn-based battle game integrated into the portal:
- **Storyline**: The Void Rift has fractured the boundary between the mortal realm and the Kunlun Sacred Mountains. Players command their minted Guardian against the **Hundun Chaos Fiend**.
- **Elemental Advantage Formula**:
  - `Water > Fire` (+50% DMG)
  - `Fire > Air` (+50% DMG)
  - `Air > Earth` (+50% DMG)
  - `Earth > Water` (+50% DMG)
  - `Void` deals and receives +40% critical damage
- **Combat Moves**:
  - *Elemental Surge*: Direct elemental attack affected by Rock-Paper-Scissors multipliers.
  - *Celestial Roar*: Chance to stun the enemy for 1 turn.
  - *Altar Ward*: Regenerates HP and reduces incoming damage by 55%.
  - *Awakened Strike*: True damage burst unlocked via the Pentagonal Altar companion ritual.

---

## 📜 4. Smart Contract Architecture

The project features 3 production-grade Solidity contracts in `contracts/`:

| Contract | Standard | Description |
|---|---|---|
| `MythicalGuardiansNFT.sol` | ERC-721 / ERC-2981 | Core PFP collection (**Max Supply: 2,222**). Stores archetype, element, power rating, and includes on-chain `checkElementalMastery` & `verifyElementalPentad`. |
| `GuardianSanctum.sol` | Altar Controller | Pentagonal ritual contract verifying 5-element ownership and triggering companion mints. |
| `GuardianCompanions.sol` | ERC-1155 Multi-Token | Exclusive companion familiar artworks awarded upon elemental convergence. |

---

## 🎨 5. The 10 Trait Categories & Rarity Architecture

The collection features **10 layered visual trait categories** providing over 160 million possible combinations:

1. **Archetype (8 Types)**: Azure Dragon, Vermilion Bird, White Tiger, Black Tortoise, Nine-Tailed Fox, Qilin, Garuda, Tengu Yōkai Lord.
2. **Element (5 Types)**: Fire (火), Water (水), Earth (地), Air (风), Void (空).
3. **Sacred Realm (10 Skies/Realms)**: Kunlun Peaks, Penglai Isle, Guixu Trench, Bamboo Sanctuary, Torii Horizon, Shifting Sands, Glacial Peak, Dragon Cloud Palace, Hundun Void Rift, Blood Moon Twilight.
4. **Sacred Halo (8 Halos)**: Bagua Eight Trigrams, Sanskrit Vajra Mandala, Auspicious Cloud Halo, Taiji Yin-Yang, Zodiac Ring, Solar Corona, Serpent Ring, Void Singularity.
5. **Aura & Weather (10 Phenomena)**: Celestial Thunderbolts, Kitsune-bi Foxfire, Golden Lotus Rain, Cosmic Star Dust, Volcanic Embers, Glacial Frost, Incense Mist, Falling Sakura, Gale Wisps, Void Tears.
6. **Body Finish (8 Textures)**: Iridescent Prismatic, Golden Leaf Fur, Obsidian Armor, Jade Carved, Ancient Bronze, Solar Crimson Plumage, Spectral Spirit, Astral Constellation.
7. **Eye Brilliance (8 Gazes)**: Luminous Jade, Molten Amber, Glacial Sapphire, Amethyst Void, Dragon Pearl Slit, Fox Spirit Moon, Third Eye of Enlightenment, All-Seeing Ocellus.
8. **Headwear / Horns (10 Crowns)**: Celestial Antlers, Phoenix Coronet, Noh Mask, Tengu Tengai, Qilin Star Horn, Tiger King Crest, Diadem, Lotus Blossom, Vajra Spikes, Natural.
9. **Sacred Relic (10 Artifacts)**: Imperial Dragon Seal, Nine-Star Mirror, Thunder Gourd, Lotus Bell, Primordial Dagger, Phoenix War Fan, Void Vajra, Dragon Pearl Orb, Bagua Compass, Moonlit Flute.
10. **Forehead Mark (8 Glyphs)**: Imperial King '王' Rune, Taiji Yin-Yang, Sun Flame Crest, Lunar Crescent, Thunder '震', Lotus Petal, Void Bindu, Untainted.

---

## 🚀 6. Quickstart & Local Execution

### Start the Interactive Web Portal:
```bash
npm start
# Runs high-performance Node.js server at http://127.0.0.1:3000
```
Open **[http://127.0.0.1:3000](http://127.0.0.1:3000)** in your browser to browse all 2,222 tokens with pagination, search, minting, and the elemental battle game.

### Run Rigorous Quality & Integrity Tests:
```bash
npm test
# Validates 100% of all 2,222 JSONs, 2,222 SVGs, trait uniqueness, and contract math
```

### Regenerate Collection Art & Metadata (Optional):
```bash
python scripts/generate_full_collection_2222.py
# Generates all 2,222 unique SVGs, JSONs, and web manifest in ~4 seconds
```
