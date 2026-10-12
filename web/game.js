/**
 * game.js
 * "Trial of the Five Elements: Rift Guardian Battle Engine"
 * 
 * Blue-Chip Web3 Turn-Based Arena Combat:
 * - Strict Round Pacing: 1 round for Player, 1 round for Enemy with real counter-attacks.
 * - Floating Combat Damage Numbers & Strike Animations (Lunge & Shake).
 * - Strict NFT Ownership Lock: Only Guardians held in the connected wallet can enter the Rift.
 * - Rarity-Tier Combat Scaling: Common, Uncommon, Rare, Epic, Legendary, and Mythic tiers dictate HP,
 *   Attack Power, Critical Strike Chance, Defense Absorption, and Stun Potency.
 * - Wu Xing Elemental Affinities: Strategic rock-paper-scissors advantage (1.5x / 0.7x) & Void chaos.
 * - Tangible Progression & Utility: Soul Shards (Aether) reward system, win streaks,
 *   permanent Battle Rank Ascensions, and the Rift Rewards Vault & Soul Bazaar.
 */

const RARITY_PROFILES = {
  Common: {
    baseHp: 320,
    baseAtk: 45,
    critChance: 0.08,
    critMult: 1.5,
    defReduction: 0.12,
    stunBonus: 0.00,
    shardReward: 45,
    badgeClass: 'tier-Common',
    borderClass: 'tier-border-Common'
  },
  Uncommon: {
    baseHp: 400,
    baseAtk: 62,
    critChance: 0.12,
    critMult: 1.6,
    defReduction: 0.18,
    stunBonus: 0.05,
    shardReward: 70,
    badgeClass: 'tier-Uncommon',
    borderClass: 'tier-border-Uncommon'
  },
  Rare: {
    baseHp: 500,
    baseAtk: 82,
    critChance: 0.16,
    critMult: 1.75,
    defReduction: 0.22,
    stunBonus: 0.08,
    shardReward: 100,
    badgeClass: 'tier-Rare',
    borderClass: 'tier-border-Rare'
  },
  Epic: {
    baseHp: 640,
    baseAtk: 110,
    critChance: 0.22,
    critMult: 1.9,
    defReduction: 0.28,
    stunBonus: 0.12,
    shardReward: 145,
    badgeClass: 'tier-Epic',
    borderClass: 'tier-border-Epic'
  },
  Legendary: {
    baseHp: 1050,
    baseAtk: 190,
    critChance: 0.38,
    critMult: 2.3,
    defReduction: 0.45,
    stunBonus: 0.20,
    shardReward: 300,
    badgeClass: 'tier-Legendary',
    borderClass: 'tier-border-Legendary'
  },
  Mythic: {
    baseHp: 1050,
    baseAtk: 190,
    critChance: 0.38,
    critMult: 2.3,
    defReduction: 0.45,
    stunBonus: 0.20,
    shardReward: 300,
    badgeClass: 'tier-Legendary',
    borderClass: 'tier-border-Legendary'
  }
};

const BATTLE_RANKS = [
  { minWins: 0, title: "Novice Guardian", bonusPct: 0.00 },
  { minWins: 1, title: "Rift Slayer", bonusPct: 0.06 },
  { minWins: 3, title: "Abyssal Vanquisher", bonusPct: 0.12 },
  { minWins: 6, title: "Celestial Deity", bonusPct: 0.20 },
  { minWins: 10, title: "Primordial Sovereign", bonusPct: 0.30 }
];

class LoreBattleEngine {
  constructor() {
    this.playerToken = null;
    this.playerBeast = null;
    this.boss = null;
    this.isPlayerTurn = true;
    this.isDefending = false;
    this.battleActive = false;
    this.roundNumber = 1;
    this.companionBonusUnlocked = false;

    this.initElements();
    this.initRewardsStore();
  }

  initElements() {
    // DOM bindings
    this.playerCard = document.getElementById('player-combatant-card');
    this.playerImg = document.getElementById('game-player-img');
    this.playerName = document.getElementById('game-player-name');
    this.playerElBadge = document.getElementById('game-player-el');
    this.playerTierBadge = document.getElementById('game-player-tier');
    this.playerRankBadge = document.getElementById('game-player-rank');
    this.playerHpFill = document.getElementById('player-hp-fill');
    this.playerHpText = document.getElementById('player-hp-text');

    this.statPlayerAtk = document.getElementById('stat-player-atk');
    this.statPlayerCrit = document.getElementById('stat-player-crit');
    this.statPlayerDef = document.getElementById('stat-player-def');

    this.bossCard = document.getElementById('boss-combatant-card');
    this.bossImg = document.getElementById('game-boss-img');
    this.bossName = document.getElementById('game-boss-name');
    this.bossElBadge = document.getElementById('game-boss-el');
    this.bossRankBadge = document.getElementById('game-boss-rank');
    this.bossHpFill = document.getElementById('boss-hp-fill');
    this.bossHpText = document.getElementById('boss-hp-text');
    this.statBossAtk = document.getElementById('stat-boss-atk');

    this.turnIndicator = document.getElementById('combat-turn-indicator');
    this.turnIndicatorText = document.getElementById('turn-indicator-text');
    this.vaultShardsDisplay = document.getElementById('vault-soul-shards-display');

    this.combatLog = document.getElementById('combat-log-content');
    this.victoryBanner = document.getElementById('game-victory-banner');
    this.victoryBannerTitle = document.getElementById('victory-banner-title');
    this.victoryBannerRewards = document.getElementById('victory-banner-rewards');

    this.btnAttack = document.getElementById('btn-attack');
    this.btnRoar = document.getElementById('btn-roar');
    this.btnWard = document.getElementById('btn-ward');
    this.btnAwakened = document.getElementById('btn-awakened-burst');
    this.btnNewBattle = document.getElementById('btn-new-battle');
    this.btnNextBattle = document.getElementById('btn-victory-next-battle');

    if (this.btnAttack) {
      this.btnAttack.addEventListener('click', () => this.handlePlayerAction('attack'));
      this.btnRoar.addEventListener('click', () => this.handlePlayerAction('roar'));
      this.btnWard.addEventListener('click', () => this.handlePlayerAction('ward'));
      this.btnAwakened.addEventListener('click', () => this.handlePlayerAction('awakened'));
    }

    if (this.btnNewBattle) {
      this.btnNewBattle.addEventListener('click', () => {
        if (this.victoryBanner) this.victoryBanner.style.display = 'none';
        this.startTrial();
      });
    }

    if (this.btnNextBattle) {
      this.btnNextBattle.addEventListener('click', () => {
        if (this.victoryBanner) this.victoryBanner.style.display = 'none';
        this.startTrial();
      });
    }

    // Guide toggle
    const btnToggleGuide = document.getElementById('btn-toggle-lore-guide');
    const guideBody = document.getElementById('game-lore-guide-body');
    if (btnToggleGuide && guideBody) {
      btnToggleGuide.addEventListener('click', () => {
        const isHidden = guideBody.style.display === 'none';
        guideBody.style.display = isHidden ? 'grid' : 'none';
        btnToggleGuide.innerText = isHidden ? 'Collapse Guide' : 'Expand Guide';
      });
    }

    // Locked connect button
    const btnGameConnect = document.getElementById('btn-game-connect-wallet');
    if (btnGameConnect) {
      btnGameConnect.addEventListener('click', () => {
        if (window.guardianApp) window.guardianApp.connectWallet(true);
      });
    }
  }

  // ========================================================
  // Rewards Vault & Store Redemption
  // ========================================================
  initRewardsStore() {
    const redeemButtons = document.querySelectorAll('.btn-redeem-reward');
    redeemButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const cost = parseInt(btn.getAttribute('data-cost') || '0', 10);
        const rewardType = btn.getAttribute('data-reward');
        this.redeemReward(rewardType, cost);
      });
    });
  }

  redeemReward(rewardType, cost) {
    const balance = this.getSoulShards();
    const app = window.guardianApp;

    if (balance < cost) {
      const msg = `Insufficient Soul Shards! You need ${cost} Shards (you have ${balance}). Win more battles in the Rift!`;
      if (app && app.showToast) app.showToast(msg, 'error');
      else alert(msg);
      return;
    }

    // Deduct shards
    const updated = this.deductSoulShards(cost);

    if (rewardType === 'voucher') {
      const voucherCount = (parseInt(localStorage.getItem('mythic_vouchers') || '0', 10)) + 1;
      localStorage.setItem('mythic_vouchers', voucherCount);
      if (app && app.showToast) {
        app.showToast(`🎉 Redeemed 1x Free Summon Voucher! (${voucherCount} available). Check Mint Portal!`, 'success');
      }
    } else if (rewardType === 'feather') {
      localStorage.setItem('mythic_has_feather', 'true');
      if (app && app.showToast) {
        app.showToast(`🪶 Phoenix Rebirth Feather activated! Your Guardian will auto-revive with 50% HP once if defeated.`, 'success');
      }
    } else if (rewardType === 'pearl') {
      localStorage.setItem('mythic_has_pearl', 'true');
      if (this.playerBeast) {
        this.playerBeast.critChance = Math.min(0.75, this.playerBeast.critChance + 0.25);
        if (this.statPlayerCrit) {
          this.statPlayerCrit.innerText = `💥 ${Math.round(this.playerBeast.critChance * 100)}% Crit (PEARL)`;
        }
      }
      if (app && app.showToast) {
        app.showToast(`🔮 Dragon Thunder Pearl equipped! +25% Critical Strike Chance unlocked!`, 'success');
      }
    } else if (rewardType === 'aegis' || rewardType === 'vip') {
      localStorage.setItem('mythic_has_aegis', 'true');
      if (this.playerBeast) {
        this.playerBeast.defense = (this.playerBeast.defense || 0) + 15;
      }
      if (app && app.showToast) {
        app.showToast(`🛡️ Celestial Aegis Crest equipped! +30% Defense shield unlocked!`, 'success');
      }
    }

    this.updateHud();
  }

  // ========================================================
  // Visual Floating Combat Numbers
  // ========================================================
  showFloatingText(targetEl, text, className) {
    if (!targetEl) return;
    const floatEl = document.createElement('div');
    floatEl.className = `combat-floating-num ${className}`;
    floatEl.innerText = text;
    targetEl.appendChild(floatEl);

    setTimeout(() => {
      if (floatEl.parentNode) floatEl.parentNode.removeChild(floatEl);
    }, 1100);
  }

  updateTurnIndicator(isPlayer) {
    if (!this.turnIndicator || !this.turnIndicatorText) return;

    if (isPlayer) {
      this.turnIndicator.className = 'combat-turn-banner player-turn';
      this.turnIndicatorText.innerHTML = `⚔️ ROUND ${this.roundNumber} — YOUR TURN: Choose your combat action below!`;
    } else {
      this.turnIndicator.className = 'combat-turn-banner enemy-turn';
      const enemyName = this.boss ? this.boss.name : "Chaos Fiend";
      this.turnIndicatorText.innerHTML = `⏳ ROUND ${this.roundNumber} — ENEMY'S TURN: ${enemyName} is striking back!`;
    }
  }

  // ========================================================
  // Wallet & Champion Sync
  // ========================================================
  syncWalletChampions() {
    const app = window.guardianApp;
    const userAddress = app ? app.userAddress : null;
    const tokens = (app && app.walletTokens) ? app.walletTokens : [];

    const lockedScreen = document.getElementById('game-locked-screen');
    const unlockedScreen = document.getElementById('game-unlocked-screen');
    const lockedDesc = document.getElementById('game-locked-desc');
    const btnConnect = document.getElementById('btn-game-connect-wallet');
    const btnMint = document.getElementById('btn-game-go-mint');

    if (!userAddress || tokens.length === 0) {
      // Locked state: require minted NFT to fight
      if (lockedScreen) lockedScreen.style.display = 'block';
      if (unlockedScreen) unlockedScreen.style.display = 'none';
      this.battleActive = false;

      if (!userAddress) {
        if (lockedDesc) {
          lockedDesc.innerText = "Connect your wallet to channel your Summoned Guardians and challenge the Void Rift.";
        }
        if (btnConnect) btnConnect.style.display = 'inline-block';
        if (btnMint) btnMint.style.display = 'none';
      } else {
        if (lockedDesc) {
          lockedDesc.innerHTML = `Your connected wallet (<code style="color:var(--gold-light);">${userAddress.slice(0,6)}...${userAddress.slice(-4)}</code>) holds 0 Guardians. Summon a Guardian from the Portal to enter the Trial of the Five Elements.`;
        }
        if (btnConnect) btnConnect.style.display = 'none';
        if (btnMint) btnMint.style.display = 'inline-block';
      }
      return;
    }

    // Unlocked: user possesses 1 or more Guardians
    if (lockedScreen) lockedScreen.style.display = 'none';
    if (unlockedScreen) unlockedScreen.style.display = 'block';

    const countEl = document.getElementById('champion-count');
    if (countEl) countEl.innerText = tokens.length;

    this.renderChampionSelector(tokens);

    // Pick active token
    const currentTokenId = this.playerToken ? Number(this.playerToken.id) : null;
    const isStillOwned = tokens.some(t => Number(t.id) === currentTokenId);

    if (!this.playerToken || !isStillOwned) {
      this.selectChampion(tokens[0], true);
    } else {
      const refreshedToken = tokens.find(t => Number(t.id) === currentTokenId) || tokens[0];
      this.selectChampion(refreshedToken, !this.battleActive);
    }

    this.updateHud();
  }

  renderChampionSelector(tokens) {
    const list = document.getElementById('game-champion-list');
    if (!list) return;

    list.innerHTML = '';
    const activeId = this.playerToken ? Number(this.playerToken.id) : Number(tokens[0].id);

    tokens.forEach(token => {
      const tokenId = Number(token.id);
      const isSelected = tokenId === activeId;
      const tier = token.tier || "Rare";
      const stats = this.getTokenStats(tokenId);
      const rank = this.getRank(stats.wins);

      const card = document.createElement('div');
      card.className = `champion-item-card ${isSelected ? 'selected' : ''}`;
      card.dataset.tokenId = tokenId;

      const imgSrc = token.image || `assets/tokens/${tokenId}.svg`;
      const tierProfile = RARITY_PROFILES[tier] || RARITY_PROFILES.Rare;

      card.innerHTML = `
        ${isSelected ? '<span class="champion-selected-badge">ACTIVE</span>' : ''}
        <img src="${imgSrc}" alt="${token.name}" />
        <div class="champion-item-name">${token.name}</div>
        <div style="display:flex; justify-content:center; gap:4px; margin-bottom:4px;">
          <span class="el-pill ${token.element?.toLowerCase() || 'fire'}" style="font-size:0.65rem; padding:1px 6px;">${token.element?.toUpperCase() || 'FIRE'}</span>
          <span class="beast-tier-badge ${tierProfile.badgeClass}">${tier.toUpperCase()}</span>
        </div>
        <div style="font-size:0.7rem; color:var(--gold-light); font-weight:600;">
          ⚔️ Power: ${token.power || 80}
        </div>
        <div style="font-size:0.65rem; color:var(--text-muted); margin-top:2px;">
          ${rank.title} (${stats.wins}W)
        </div>
      `;

      card.addEventListener('click', () => {
        if (Number(this.playerToken?.id) !== tokenId) {
          this.selectChampion(token, true);
        }
      });

      list.appendChild(card);
    });
  }

  selectChampion(token, startBattleImmediately = false) {
    if (!token) return;
    this.playerToken = token;

    // Recalculate stats based on rarity tier, power, and rank
    const tier = token.tier || "Rare";
    const profile = RARITY_PROFILES[tier] || RARITY_PROFILES.Rare;
    const power = Number(token.power || token.properties?.power_rating || 80);
    const stats = this.getTokenStats(token.id);
    const rank = this.getRank(stats.wins);

    // Apply Dragon Pearl relic bonus if owned
    const hasPearl = localStorage.getItem('mythic_has_pearl') === 'true';
    const bonusCrit = hasPearl ? 0.25 : 0.00;

    const maxHp = Math.floor((profile.baseHp + (power * 2.5)) * (1 + rank.bonusPct));
    const baseAtk = Math.floor((profile.baseAtk + (power * 0.9)) * (1 + rank.bonusPct));

    this.playerBeast = {
      id: Number(token.id),
      name: token.name || `Guardian #${token.id}`,
      archetype: token.archetype || "Mythical Guardian",
      element: token.element || "Fire",
      tier: tier,
      tierProfile: profile,
      power: power,
      rank: rank,
      stats: stats,
      maxHp: maxHp,
      hp: maxHp,
      baseAtk: baseAtk,
      critChance: profile.critChance + bonusCrit,
      critMult: profile.critMult,
      defReduction: profile.defReduction,
      stunBonus: profile.stunBonus,
      image: token.image || `assets/tokens/${token.id}.svg`
    };

    // Update Arena Player Card UI
    if (this.playerName) this.playerName.innerText = this.playerBeast.name;
    if (this.playerImg) this.playerImg.src = this.playerBeast.image;

    if (this.playerElBadge) {
      this.playerElBadge.innerText = this.playerBeast.element.toUpperCase();
      this.playerElBadge.className = `el-pill ${this.playerBeast.element.toLowerCase()}`;
    }

    if (this.playerTierBadge) {
      this.playerTierBadge.innerText = tier.toUpperCase();
      this.playerTierBadge.className = `beast-tier-badge ${profile.badgeClass}`;
    }

    if (this.playerRankBadge) {
      this.playerRankBadge.innerText = rank.title;
      this.playerRankBadge.title = `Wins: ${stats.wins} (+${Math.round(rank.bonusPct * 100)}% battle stat bonus)`;
    }

    if (this.playerCard) {
      this.playerCard.className = `combatant-card player ${profile.borderClass}`;
    }

    if (this.statPlayerAtk) this.statPlayerAtk.innerText = `⚔️ ${this.playerBeast.baseAtk} ATK`;
    if (this.statPlayerCrit) this.statPlayerCrit.innerText = `💥 ${Math.round(this.playerBeast.critChance * 100)}% Crit${hasPearl ? ' (PEARL)' : ''}`;
    if (this.statPlayerDef) this.statPlayerDef.innerText = `🛡️ +${Math.round(this.playerBeast.defReduction * 100)}% Def`;

    this.updateHpUI();

    // Re-render carousel to update active pill
    if (window.guardianApp && window.guardianApp.walletTokens) {
      this.renderChampionSelector(window.guardianApp.walletTokens);
    }

    if (startBattleImmediately) {
      this.startTrial();
    }
  }

  // ========================================================
  // Battle Lifecycle
  // ========================================================
  startTrial() {
    if (!this.playerBeast) {
      this.syncWalletChampions();
      if (!this.playerBeast) return;
    }

    if (this.victoryBanner) this.victoryBanner.style.display = 'none';

    // Reset player HP and round count
    this.playerBeast.hp = this.playerBeast.maxHp;
    this.roundNumber = 1;

    // Check Pentad Altar Companion awakening
    const hasCompanion = !!(window.guardianApp && window.guardianApp.hasCompanionAwakened);
    this.companionBonusUnlocked = hasCompanion || (this.playerBeast.tier === 'Legendary');

    // Dynamic Boss Generation scaled to Player's Rarity Tier
    const bossElements = ["Fire", "Water", "Earth", "Air", "Void"];
    const randomEl = bossElements[Math.floor(Math.random() * bossElements.length)];

    // Boss stats scale to challenge player rarity tier
    const pTier = this.playerBeast.tier;
    let bossHp = 480;
    let bossAtk = 90;
    let bossTitle = "Void Fiend";

    if (pTier === 'Common') {
      bossHp = 380;
      bossAtk = 65;
      bossTitle = "Lesser Shadow Fiend";
    } else if (pTier === 'Uncommon') {
      bossHp = 480;
      bossAtk = 85;
      bossTitle = "Corrupted Rift Crawler";
    } else if (pTier === 'Rare') {
      bossHp = 600;
      bossAtk = 110;
      bossTitle = "Chaos Void Fiend";
    } else if (pTier === 'Epic') {
      bossHp = 780;
      bossAtk = 145;
      bossTitle = "Hundun Abyssal Fiend";
    } else if (pTier === 'Legendary' || pTier === 'Mythic') {
      bossHp = 1050;
      bossAtk = 190;
      bossTitle = "Primordial Hundun Devourer (Max Trial)";
    }

    this.boss = {
      name: `${bossTitle} (${randomEl})`,
      element: randomEl,
      maxHp: bossHp,
      hp: bossHp,
      power: bossAtk,
      stunned: false,
      image: "assets/beasts/VoidFiend_Boss.svg"
    };

    if (this.bossName) this.bossName.innerText = this.boss.name;
    if (this.bossImg) this.bossImg.src = this.boss.image;
    if (this.bossElBadge) {
      this.bossElBadge.innerText = this.boss.element.toUpperCase();
      this.bossElBadge.className = `el-pill ${this.boss.element.toLowerCase()}`;
    }
    if (this.bossRankBadge) {
      this.bossRankBadge.innerText = `${pTier} Challenge`;
    }
    if (this.statBossAtk) {
      this.statBossAtk.innerText = `👹 ${this.boss.power} ATK`;
    }

    this.isPlayerTurn = true;
    this.isDefending = false;
    this.battleActive = true;

    // Enable/disable Awakened Strike button
    if (this.btnAwakened) {
      if (this.companionBonusUnlocked) {
        this.btnAwakened.disabled = false;
        this.btnAwakened.title = (this.playerBeast.tier === 'Legendary' || this.playerBeast.tier === 'Mythic')
          ? "Legendary Primordial Singularity Strike (Max Tier Innate Aura)" 
          : "Awakened Companion Strike (Unlocked at the Altar)";
      } else {
        this.btnAwakened.disabled = true;
        this.btnAwakened.title = "Awaken all 5 Elemental Guardians at the Altar to unlock";
      }
    }

    this.updateTurnIndicator(true);
    this.setControlsDisabled(false);
    this.clearLog();
    this.log(`⚔️ ROUND 1: The Trial of the Five Elements has commenced!`, 'log-highlight');
    this.log(`Your [${this.playerBeast.tier.toUpperCase()}] ${this.playerBeast.name} (${this.playerBeast.element}) faces ${this.boss.name}!`);
    this.log(`Take turns: 1 round for you, 1 round for the enemy. Counter their elemental affinity!`);
    this.updateHpUI();
  }

  getElementalMultiplier(attackerEl, defenderEl, isPlayer = true) {
    // Legendary true singularity: ignores damage penalty
    if (isPlayer && (this.playerBeast?.tier === 'Legendary' || this.playerBeast?.tier === 'Mythic') && attackerEl === this.playerBeast.element) {
      if (defenderEl === 'Void') return 1.5;
      if (attackerEl === "Fire" && defenderEl === "Air") return 1.6;
      if (attackerEl === "Air" && defenderEl === "Earth") return 1.6;
      if (attackerEl === "Earth" && defenderEl === "Water") return 1.6;
      if (attackerEl === "Water" && defenderEl === "Fire") return 1.6;
      return 1.25; // Never reduced!
    }

    if (attackerEl === "Void" || defenderEl === "Void") return 1.4;
    if (attackerEl === "Fire" && defenderEl === "Air") return 1.5;
    if (attackerEl === "Air" && defenderEl === "Earth") return 1.5;
    if (attackerEl === "Earth" && defenderEl === "Water") return 1.5;
    if (attackerEl === "Water" && defenderEl === "Fire") return 1.5;

    // Disadvantages
    if (attackerEl === "Air" && defenderEl === "Fire") return 0.7;
    if (attackerEl === "Earth" && defenderEl === "Air") return 0.7;
    if (attackerEl === "Water" && defenderEl === "Earth") return 0.7;
    if (attackerEl === "Fire" && defenderEl === "Water") return 0.7;

    return 1.0;
  }

  // ========================================================
  // Player Turn Execution
  // ========================================================
  handlePlayerAction(action) {
    if (!this.battleActive) {
      this.startTrial();
      return;
    }
    if (!this.battleActive || !this.isPlayerTurn) return;

    // 1. Lock turn immediately
    this.isPlayerTurn = false;
    this.setControlsDisabled(true);

    // 2. Animate player card lunge
    if (this.playerCard) {
      this.playerCard.classList.add('anim-lunge-player');
      setTimeout(() => this.playerCard.classList.remove('anim-lunge-player'), 400);
    }

    if (action === 'attack') {
      const mult = this.getElementalMultiplier(this.playerBeast.element, this.boss.element, true);
      let dmg = Math.floor(this.playerBeast.baseAtk * (0.85 + Math.random() * 0.3));
      dmg = Math.floor(dmg * mult);

      // Check Critical Strike based on Rarity Tier
      const isCrit = Math.random() < this.playerBeast.critChance;
      if (isCrit) {
        dmg = Math.floor(dmg * this.playerBeast.critMult);
      }

      if (window.mythicAudio) window.mythicAudio.playAttackSound(this.playerBeast.element);

      this.boss.hp = Math.max(0, this.boss.hp - dmg);

      // Visual boss hit shake and floating damage number
      setTimeout(() => {
        if (this.bossCard) {
          this.bossCard.classList.add('anim-damage-shake');
          setTimeout(() => this.bossCard.classList.remove('anim-damage-shake'), 450);
        }
        this.showFloatingText(this.bossCard, isCrit ? `💥 -${dmg} CRIT!` : `-${dmg}`, isCrit ? 'dmg-boss crit' : 'dmg-boss');
      }, 150);

      let effectiveness = mult > 1.2 ? " [SUPER EFFECTIVE!]" : mult < 0.9 ? " [WEAK RESISTANCE]" : "";
      if (isCrit) {
        this.log(`💥 CRITICAL STRIKE! ${this.playerBeast.name} unleashes ${this.playerBeast.element} Surge dealing ${dmg} DMG!${effectiveness}`, 'log-crit');
      } else {
        this.log(`🌟 ${this.playerBeast.name} strikes with ${this.playerBeast.element} Surge dealing ${dmg} DMG!${effectiveness}`, 'log-player');
      }

    } else if (action === 'roar') {
      // Celestial Roar: Weaken Boss attack and chance to stun
      const stunChance = 0.20 + this.playerBeast.stunBonus;
      const isStunned = Math.random() < stunChance;
      const chipDmg = Math.floor(this.playerBeast.baseAtk * 0.50);

      this.boss.hp = Math.max(0, this.boss.hp - chipDmg);
      if (window.mythicAudio) window.mythicAudio.playAttackSound('Void');

      setTimeout(() => {
        if (this.bossCard) {
          this.bossCard.classList.add('anim-damage-shake');
          setTimeout(() => this.bossCard.classList.remove('anim-damage-shake'), 450);
        }
        this.showFloatingText(this.bossCard, `-${chipDmg}`, 'dmg-boss');
      }, 150);

      if (isStunned) {
        this.boss.stunned = true;
        this.log(`📢 Celestial Roar shakes the realm! Deals ${chipDmg} DMG and STUNS the fiend!`, 'log-crit');
      } else {
        this.boss.power = Math.max(30, Math.floor(this.boss.power * 0.85)); // Weakens boss
        this.log(`📢 Celestial Roar echoes, dealing ${chipDmg} DMG and WEAKENING the fiend's attack power!`, 'log-player');
      }

    } else if (action === 'ward') {
      // Altar Ward: Regenerate HP & Raise Barrier
      this.isDefending = true;
      const healPct = 0.20 + ((this.playerBeast.tier === 'Legendary' || this.playerBeast.tier === 'Mythic') ? 0.08 : 0);
      const heal = Math.floor(this.playerBeast.maxHp * healPct);
      this.playerBeast.hp = Math.min(this.playerBeast.maxHp, this.playerBeast.hp + heal);

      if (window.mythicAudio) window.mythicAudio.playAttackSound('Water');
      this.showFloatingText(this.playerCard, `+${heal} HP`, 'heal-player');
      this.log(`🛡️ Guardian Altar Ward cast! Regenerated +${heal} HP and raised protective barrier!`, 'log-player');

    } else if (action === 'awakened') {
      // Awakened Burst: True Celestial DMG
      const burstDmg = Math.floor(this.playerBeast.baseAtk * 2.1 + 80);
      this.boss.hp = Math.max(0, this.boss.hp - burstDmg);

      if (window.mythicAudio) window.mythicAudio.playRitualAwakeningSound();

      setTimeout(() => {
        if (this.bossCard) {
          this.bossCard.classList.add('anim-damage-shake');
          setTimeout(() => this.bossCard.classList.remove('anim-damage-shake'), 450);
        }
        this.showFloatingText(this.bossCard, `✨ -${burstDmg} TRUE DMG`, 'dmg-boss crit');
      }, 150);

      this.log(`✨ AWAKENED CELESTIAL STRIKE! Deals ${burstDmg} TRUE DAMAGE to the Void Fiend!`, 'log-crit');
    }

    this.updateHpUI();

    // Check Boss Defeat
    if (this.boss.hp <= 0) {
      setTimeout(() => this.handleVictory(), 600);
      return;
    }

    // 3. Switch Turn Banner to Enemy's Turn
    this.updateTurnIndicator(false);

    // 4. Enemy Turn follows after 1,200ms delay so player clearly sees both rounds
    setTimeout(() => this.bossTurn(), 1200);
  }

  // ========================================================
  // Enemy Counter-Attack Turn Execution
  // ========================================================
  bossTurn() {
    if (!this.battleActive) return;

    // Check if boss was stunned
    if (this.boss.stunned) {
      this.boss.stunned = false;
      this.showFloatingText(this.bossCard, '🌀 STUNNED!', 'stunned');
      this.log(`🌀 ${this.boss.name} is stunned and struggles to retaliate this round!`, 'log-highlight');

      // Advance round and return turn to player
      this.roundNumber++;
      setTimeout(() => {
        this.isPlayerTurn = true;
        this.updateTurnIndicator(true);
        this.setControlsDisabled(false);
      }, 800);
      return;
    }

    // 1. Animate Boss Card lunge into player
    if (this.bossCard) {
      this.bossCard.classList.add('anim-lunge-enemy');
      setTimeout(() => this.bossCard.classList.remove('anim-lunge-enemy'), 400);
    }

    // 2. Calculate Boss Damage (Must be real, dangerous damage!)
    const mult = this.getElementalMultiplier(this.boss.element, this.playerBeast.element, false);
    const isSpecialAttack = Math.random() > 0.50;
    const baseMult = isSpecialAttack ? 1.05 : 0.85;

    let bossDmg = Math.floor((this.boss.power * baseMult) + (Math.random() * 20));
    bossDmg = Math.floor(bossDmg * mult);

    // Apply Player Defense Reduction (e.g. 30% - 48%)
    const defRate = this.playerBeast.defReduction * 0.75;
    bossDmg = Math.floor(bossDmg * (1 - defRate));

    if (this.isDefending) {
      bossDmg = Math.floor(bossDmg * 0.50);
      this.isDefending = false;
      this.log(`🛡️ Your Altar Barrier absorbed 50% of the shockwave!`, 'log-player');
    }

    // Ensure boss always deals substantial damage (at least 15% of max HP on high challenges)
    const minDmg = Math.floor(this.playerBeast.maxHp * 0.12);
    bossDmg = Math.max(minDmg, bossDmg);

    if (window.mythicAudio) window.mythicAudio.playAttackSound(this.boss.element);

    // Apply player hit animation and floating damage
    setTimeout(() => {
      if (this.playerCard) {
        this.playerCard.classList.add('anim-damage-shake');
        setTimeout(() => this.playerCard.classList.remove('anim-damage-shake'), 450);
      }
      this.showFloatingText(this.playerCard, `-${bossDmg}`, 'dmg-player');
    }, 150);

    this.playerBeast.hp = Math.max(0, this.playerBeast.hp - bossDmg);

    const moveName = isSpecialAttack 
      ? `💥 Cataclysmic ${this.boss.element} Scythe` 
      : `👹 Abyssal Void Strike`;

    this.log(`👹 ${this.boss.name} retaliates with ${moveName}! You take ${bossDmg} DMG!`, 'log-enemy');
    this.updateHpUI();

    // Check Player Defeat
    if (this.playerBeast.hp <= 0) {
      // Check Phoenix Feather Relic
      const hasFeather = localStorage.getItem('mythic_has_feather') === 'true';
      if (hasFeather) {
        localStorage.removeItem('mythic_has_feather');
        const reviveHp = Math.floor(this.playerBeast.maxHp * 0.50);
        this.playerBeast.hp = reviveHp;
        this.updateHpUI();
        this.showFloatingText(this.playerCard, `+${reviveHp} REVIVED!`, 'heal-player');
        this.log(`🪶 PHOENIX REBIRTH! The Vermilion Feather restored your Guardian to life with ${reviveHp} HP!`, 'log-crit');
      } else {
        setTimeout(() => this.handleDefeat(), 600);
        return;
      }
    }

    // 3. Advance round counter and hand turn back to player
    this.roundNumber++;
    setTimeout(() => {
      this.isPlayerTurn = true;
      this.updateTurnIndicator(true);
      this.setControlsDisabled(false);
    }, 800);
  }

  // ========================================================
  // Victory & Rewards Handling
  // ========================================================
  handleVictory() {
    this.battleActive = false;
    this.setControlsDisabled(true);

    if (window.mythicAudio) window.mythicAudio.playRitualAwakeningSound();

    const tokenId = this.playerBeast.id;
    const tierProfile = this.playerBeast.tierProfile;
    const shardGain = tierProfile.shardReward + (this.playerBeast.power > 90 ? 35 : 0);

    // 1. Update Soul Shards in Wallet
    const totalShards = this.addSoulShards(shardGain);

    // 2. Update Token Record (Wins, Streak)
    const prevStats = this.getTokenStats(tokenId);
    const prevRank = this.getRank(prevStats.wins);

    const newStats = {
      wins: prevStats.wins + 1,
      losses: prevStats.losses,
      streak: prevStats.streak + 1
    };
    this.saveTokenStats(tokenId, newStats);

    const newRank = this.getRank(newStats.wins);
    const didRankUp = newRank.title !== prevRank.title;

    // Log Victory & Rewards
    this.log(`🏆 VICTORY IN THE TRIAL OF THE FIVE ELEMENTS!`, 'log-highlight');
    this.log(`🎉 Your [${this.playerBeast.tier.toUpperCase()}] ${this.playerBeast.name} triumphed over ${this.boss.name}!`, 'log-player');
    this.log(`🪙 REWARDS: +${shardGain} Rift Soul Shards awarded! (Wallet Balance: ${totalShards})`, 'log-highlight');

    if (didRankUp) {
      this.log(`🌟 RANK PROMOTION! Your Guardian ascended to "${newRank.title}" (+${Math.round(newRank.bonusPct * 100)}% battle stats)!`, 'log-crit');
    }

    // Display In-Page Victory Banner
    if (this.victoryBanner) {
      this.victoryBanner.style.display = 'block';
      if (this.victoryBannerTitle) {
        this.victoryBannerTitle.innerText = `VICTORY OVER ${this.boss.name.toUpperCase()}!`;
      }
      if (this.victoryBannerRewards) {
        this.victoryBannerRewards.innerHTML = `
          <strong>+${shardGain} Soul Shards</strong> awarded! | 
          Rift Wins: <strong>${newStats.wins}</strong> | 
          Streak: <strong>${newStats.streak}🔥</strong>
          ${didRankUp ? ` | <span style="color:#ffd700; font-weight:700;">Promoted to ${newRank.title}!</span>` : ''}
        `;
      }
    }

    // Refresh HUD, Vault store balance, and Champion Selector
    this.updateHud();
    if (window.guardianApp && window.guardianApp.walletTokens) {
      this.renderChampionSelector(window.guardianApp.walletTokens);
    }
    if (this.playerRankBadge) {
      this.playerRankBadge.innerText = newRank.title;
    }
  }

  handleDefeat() {
    this.battleActive = false;
    this.setControlsDisabled(true);

    const tokenId = this.playerBeast.id;
    const prevStats = this.getTokenStats(tokenId);

    const newStats = {
      wins: prevStats.wins,
      losses: prevStats.losses + 1,
      streak: 0 // Reset streak on defeat
    };
    this.saveTokenStats(tokenId, newStats);

    this.log(`💀 Your guardian fell in the trial. Channel the sacred elements and retry!`, 'log-enemy');
    this.log(`Tip: Equip a Phoenix Rebirth Feather from the Rewards Vault to survive lethal strikes.`, 'log-highlight');
    this.log(`Click "New Battle" to challenge the Void Rift again.`, 'log-highlight');

    this.updateHud();
  }

  // ========================================================
  // Progress & LocalStorage Tracking
  // ========================================================
  getUserAddress() {
    return window.guardianApp?.userAddress?.toLowerCase() || 'default_summoner';
  }

  getSoulShards() {
    const addr = this.getUserAddress();
    const raw = localStorage.getItem(`mythic_shards_${addr}`);
    return raw ? parseInt(raw, 10) : 0;
  }

  addSoulShards(amount) {
    const addr = this.getUserAddress();
    const current = this.getSoulShards();
    const updated = current + amount;
    localStorage.setItem(`mythic_shards_${addr}`, updated);
    return updated;
  }

  deductSoulShards(amount) {
    const addr = this.getUserAddress();
    const current = this.getSoulShards();
    const updated = Math.max(0, current - amount);
    localStorage.setItem(`mythic_shards_${addr}`, updated);
    return updated;
  }

  getTokenStats(tokenId) {
    const raw = localStorage.getItem(`mythic_record_${tokenId}`);
    if (raw) {
      try { return JSON.parse(raw); } catch (e) {}
    }
    return { wins: 0, losses: 0, streak: 0 };
  }

  saveTokenStats(tokenId, stats) {
    localStorage.setItem(`mythic_record_${tokenId}`, JSON.stringify(stats));
  }

  getRank(wins) {
    let currentRank = BATTLE_RANKS[0];
    for (const r of BATTLE_RANKS) {
      if (wins >= r.minWins) {
        currentRank = r;
      }
    }
    return currentRank;
  }

  updateHud() {
    const userAddress = window.guardianApp?.userAddress;
    const hudWallet = document.getElementById('game-hud-wallet');
    const hudShards = document.getElementById('game-hud-shards');
    const hudWins = document.getElementById('game-hud-wins');
    const hudStreak = document.getElementById('game-hud-streak');
    const shards = this.getSoulShards();

    if (hudWallet) {
      hudWallet.innerText = userAddress ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}` : 'Disconnected';
    }

    if (hudShards) {
      hudShards.innerText = shards;
    }

    if (this.vaultShardsDisplay) {
      this.vaultShardsDisplay.innerText = shards;
    }

    if (this.playerToken) {
      const stats = this.getTokenStats(this.playerToken.id);
      if (hudWins) hudWins.innerText = `${stats.wins} Wins`;
      if (hudStreak) hudStreak.innerText = `${stats.streak} Streak`;
    } else {
      if (hudWins) hudWins.innerText = '0 Wins';
      if (hudStreak) hudStreak.innerText = '0 Streak';
    }
  }

  // ========================================================
  // UI Helpers
  // ========================================================
  updateHpUI() {
    if (this.playerBeast) {
      const pPct = Math.max(0, (this.playerBeast.hp / this.playerBeast.maxHp) * 100);
      if (this.playerHpFill) this.playerHpFill.style.width = `${pPct}%`;
      if (this.playerHpText) this.playerHpText.innerText = `${this.playerBeast.hp} / ${this.playerBeast.maxHp} HP`;
    }

    if (this.boss) {
      const bPct = Math.max(0, (this.boss.hp / this.boss.maxHp) * 100);
      if (this.bossHpFill) this.bossHpFill.style.width = `${bPct}%`;
      if (this.bossHpText) this.bossHpText.innerText = `${this.boss.hp} / ${this.boss.maxHp} HP`;
    }
  }

  setControlsDisabled(disabled) {
    if (this.btnAttack) this.btnAttack.disabled = disabled;
    if (this.btnRoar) this.btnRoar.disabled = disabled;
    if (this.btnWard) this.btnWard.disabled = disabled;

    if (this.btnAwakened) {
      if (!this.companionBonusUnlocked) {
        this.btnAwakened.disabled = true;
      } else {
        this.btnAwakened.disabled = disabled;
      }
    }
  }

  clearLog() {
    if (this.combatLog) this.combatLog.innerHTML = '';
  }

  log(msg, className = '') {
    if (!this.combatLog) return;
    const p = document.createElement('p');
    if (className) p.className = className;
    p.innerText = msg;
    this.combatLog.appendChild(p);
    this.combatLog.scrollTop = this.combatLog.scrollHeight;
  }
}

window.loreBattle = new LoreBattleEngine();

document.addEventListener('DOMContentLoaded', () => {
  if (window.loreBattle) {
    window.loreBattle.syncWalletChampions();
  }
});
