/**
 * app.js
 * Core application script for Mythical Beasts & Guardians NFT (2,222 Supply)
 * Real Web3 Integration for GIWA Sepolia Testnet (Chain ID 91342):
 * - MetaMask / EIP-6963 Wallet Connection & Auto Network Switcher
 * - 1-Click Smart Contract Deployment to GIWA Sepolia
 * - Live On-Chain Minting (summonGuardians) & Event Parsing
 * - The Pentagonal Altar (5 Elements Awakening) & Lore Battle Game
 * - 2,222 Token Gallery with Search, Filters & Pagination
 */

// Destination Wallet for 100% Mint Funds & 5% OpenSea Royalties
const DESTINATION_PAYOUT_WALLET = "0xb862866110dbF9aD25d25A85422101d0b03615c3";

// Robinhood Chain Networks (Arbitrum Orbit L2)
const ROBINHOOD_MAINNET_PARAMS = {
  chainIdHex: '0x1237', // 4663 in Hex
  chainIdDec: 4663,
  chainName: 'Robinhood Chain',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: ['https://rpc.mainnet.chain.robinhood.com'],
  blockExplorerUrls: ['https://robinhoodchain.blockscout.com'],
  openseaBase: 'https://opensea.io/item/robinhood'
};

const ROBINHOOD_TESTNET_PARAMS = {
  chainIdHex: '0xb626', // 46630 in Hex
  chainIdDec: 46630,
  chainName: 'Robinhood Chain Testnet',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: ['https://rpc.testnet.chain.robinhood.com'],
  blockExplorerUrls: ['https://explorer.testnet.chain.robinhood.com'],
  openseaBase: 'https://testnets.opensea.io/assets/robinhood-testnet'
};

const GIWA_CHAIN_ID_HEX = '0x164ce'; // 91342 in Hex
const GIWA_CHAIN_ID_DEC = 91342;
const GIWA_RPC_URL = 'https://sepolia-rpc.giwa.io';
const GIWA_EXPLORER_URL = 'https://sepolia-explorer.giwa.io';

const GIWA_PARAMS = {
  chainId: GIWA_CHAIN_ID_HEX,
  chainName: 'GIWA Sepolia Testnet',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: [GIWA_RPC_URL],
  blockExplorerUrls: [GIWA_EXPLORER_URL]
};

const ARCHETYPE_NAMES = [
  "Azure Dragon",
  "Vermilion Bird",
  "White Tiger",
  "Black Tortoise",
  "Nine-Tailed Fox",
  "Qilin",
  "Garuda",
  "Tengu"
];

const ELEMENT_NAMES = ["Fire", "Water", "Earth", "Air", "Void"];

class GuardianApp {
  constructor() {
    this.tokens = [];
    this.filteredTokens = [];
    this.walletTokens = [];
    this.activeListings = [];
    this.optimisticRemovedListings = {};
    this.currentMintQty = 1;
    this.mintPriceEth = 0.0005; // Friendly testnet mint tribute
    this.treasuryAddress = DESTINATION_PAYOUT_WALLET;

    // Web3 State
    this.provider = null;
    this.signer = null;
    this.userAddress = null;
    this.currentChainId = null;
    this.contractAddress = null;
    this.contract = null;
    this.contractArtifact = null;

    // Gallery Pagination
    this.currentPage = 1;
    this.pageSize = 24;

    this.init();
  }

  async init() {
    this.initCanvasParticles();
    this.initNavigation();
    this.initHeroShowcaseSlider();
    this.initAudioButton();
    await this.loadContractArtifact();
    await this.loadActiveContractAddress();
    await this.loadTokens();
    this.initWeb3Listeners();
    this.initContractManagementUI();
    this.initMintControls();
    this.initGalleryFilters();
    this.updateAltarStatus();
  }

  // ==========================================
  // Toast Notifications
  // ==========================================
  showToast(message, type = 'info', linkUrl = null, linkText = 'View on Explorer ↗') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    let linkHtml = linkUrl ? `<br><a href="${linkUrl}" target="_blank" style="font-weight:700;">${linkText}</a>` : '';
    toast.innerHTML = `<div>${message}</div>${linkHtml}`;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.5s ease';
      setTimeout(() => toast.remove(), 500);
    }, 6000);
  }

  // ==========================================
  // Background Particle Canvas (5 Elements)
  // ==========================================
  initCanvasParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const colors = ['#FF3B30', '#007AFF', '#34C759', '#70E4EF', '#BF5AF2', '#FFD700'];
    const particles = [];
    for (let i = 0; i < 75; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.2 + 0.8,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 0.6,
        vy: -Math.random() * 0.8 - 0.2,
        alpha: Math.random() * 0.7 + 0.3
      });
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
      });
      requestAnimationFrame(animate);
    }
    animate();
  }

  // ==========================================
  // Navigation
  // ==========================================
  initNavigation() {
    const navLinks = document.querySelectorAll('nav a[data-tab]');
    navLinks.forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const tabId = link.getAttribute('data-tab');
        this.switchTab(tabId);
      });
    });

    document.querySelectorAll('[data-tab]').forEach(el => {
      if (el.tagName !== 'A') {
        el.addEventListener('click', () => {
          const tabId = el.getAttribute('data-tab');
          if (tabId) this.switchTab(tabId);
        });
      }
    });
  }

  initHeroShowcaseSlider() {
    const card = document.getElementById('hero-holo-card');
    const track = document.getElementById('hero-slider-track');
    const imgCurr = document.getElementById('hero-img-curr');
    const imgNext = document.getElementById('hero-img-next');
    const tierBadge = document.getElementById('hero-showcase-tier');
    const elPill = document.getElementById('hero-showcase-el');
    const progressBar = document.getElementById('hero-slide-progress');

    if (!track || !imgCurr || !imgNext) return;

    const initialPool = [
      { id: 4, name: "Azure Dragon #0004", image: "assets/beasts/AzureDragon_Air.svg", tier: "Mythic", element: "Air" },
      { id: 3, name: "Vermilion Bird #0003", image: "assets/beasts/VermilionBird_Fire.svg", tier: "Legendary", element: "Fire" },
      { id: 5, name: "White Tiger #0005", image: "assets/beasts/WhiteTiger_Earth.svg", tier: "Legendary", element: "Void" },
      { id: 1, name: "Black Tortoise #0001", image: "assets/beasts/BlackTortoise_Water.svg", tier: "Epic", element: "Water" },
      { id: 16, name: "Celestial Qilin #0016", image: "assets/beasts/Qilin_Air.svg", tier: "Mythic", element: "Fire" },
      { id: 8, name: "Nine-Tailed Fox #0008", image: "assets/beasts/NineTailedFox_Air.svg", tier: "Epic", element: "Air" },
      { id: 12, name: "Solar Garuda #0012", image: "assets/beasts/Garuda_Fire.svg", tier: "Legendary", element: "Earth" },
      { id: 22, name: "Storm Tengu #0022", image: "assets/beasts/Tengu_Void.svg", tier: "Epic", element: "Void" }
    ];

    const getPool = () => {
      return (this.tokens && this.tokens.length > 0) ? this.tokens : initialPool;
    };

    const elIcons = {
      Fire: '🔥',
      Water: '🌊',
      Earth: '⛰️',
      Air: '🌪️',
      Void: '🌌'
    };

    let idx = 0;
    let isSliding = false;

    const tick = () => {
      if (isSliding) return;
      const pool = getPool();
      if (!pool || pool.length === 0) return;

      // Random selection instead of 1, 2, 3 sequence
      let nextIdx = Math.floor(Math.random() * pool.length);
      if (pool.length > 1 && nextIdx === idx) {
        nextIdx = (nextIdx + 1) % pool.length;
      }
      idx = nextIdx;
      const token = pool[idx];

      const name = token.name || `Guardian #${token.id || idx + 1}`;
      const image = token.image || `assets/tokens/${token.id || 1}.svg`;
      const tier = token.tier || token.attributes?.find(a => a.trait_type === 'Rarity Tier')?.value || 'Rare';
      const element = token.element || token.properties?.element_name || 'Air';

      isSliding = true;

      // Prepare incoming image on the right
      imgNext.src = image;

      // Trigger hardware-accelerated slide to the left
      track.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
      track.style.transform = 'translateX(-50%)';

      // Update badges during slide
      if (tierBadge) {
        tierBadge.className = `beast-tier-badge tier-${tier}`;
        tierBadge.innerText = tier.toUpperCase();
      }
      if (elPill) {
        const icon = elIcons[element] || '✨';
        elPill.className = `el-pill ${element.toLowerCase()}`;
        elPill.innerText = `${icon} ${element.toUpperCase()}`;
      }

      // Progress bar fill
      if (progressBar) {
        progressBar.style.transition = 'none';
        progressBar.style.width = '0%';
        void progressBar.offsetWidth;
        progressBar.style.transition = 'width 2.2s linear';
        progressBar.style.width = '100%';
      }

      // Once the slide animation finishes, swap curr image and reset track to 0 instantly
      setTimeout(() => {
        imgCurr.src = image;
        track.style.transition = 'none';
        track.style.transform = 'translateX(0)';
        void track.offsetWidth;
        isSliding = false;
      }, 620);
    };

    // Card click opens inspector modal for active guardian
    if (card) {
      card.addEventListener('click', () => {
        const pool = getPool();
        const currentToken = pool[idx] || pool[0];
        if (currentToken) this.openInspectorModal(currentToken);
      });
    }

    // Initial progress bar
    if (progressBar) {
      progressBar.style.transition = 'width 2.2s linear';
      progressBar.style.width = '100%';
    }

    // Start auto slide timer
    if (this.heroShowcaseTimer) clearInterval(this.heroShowcaseTimer);
    this.heroShowcaseTimer = setInterval(tick, 2200);
  }

  switchTab(tabId) {
    document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));

    const targetSection = document.getElementById(tabId);
    if (targetSection) targetSection.classList.add('active');

    const activeNav = document.querySelector(`nav a[data-tab="${tabId}"]`);
    if (activeNav) activeNav.classList.add('active');

    if (tabId === 'tab-game' && window.loreBattle) {
      window.loreBattle.syncWalletChampions();
    } else if (tabId === 'tab-altar') {
      this.updateAltarStatus();
    } else if (tabId === 'tab-gallery') {
      this.renderGallery();
    }
  }

  initAudioButton() {
    const btnAudio = document.getElementById('btn-toggle-sound');
    if (!btnAudio) return;
    btnAudio.addEventListener('click', () => {
      if (window.mythicAudio) {
        const playing = window.mythicAudio.toggleAmbient();
        btnAudio.innerHTML = playing ? '🔊 Ambient Chimes: On' : '🔇 Ambient Sound';
      }
    });
  }

  // ==========================================
  // Load Artifacts & Metadata
  // ==========================================
  async loadContractArtifact() {
    try {
      const res = await fetch(`assets/MythicalGuardiansNFT.json?v=${Date.now()}`);
      this.contractArtifact = await res.json();
    } catch (e) {
      console.warn("Could not load contract artifact:", e);
    }
  }

  async loadActiveContractAddress() {
    try {
      localStorage.removeItem('giwa_mythic_contract');
      localStorage.removeItem('robinhood_mythic_contract');
      let data = null;
      try {
        const res = await fetch(`/api/contract?v=${Date.now()}`);
        if (res.ok) data = await res.json();
      } catch (_) {}

      // Fallback for static hosting (e.g. GitHub Pages)
      if (!data) {
        try {
          const res = await fetch(`assets/contract_address.json?v=${Date.now()}`);
          if (res.ok) data = await res.json();
        } catch (_) {}
      }

      if (data && data.address && data.chainId === ROBINHOOD_MAINNET_PARAMS.chainIdDec) {
        this.contractAddress = data.address;
      } else {
        this.contractAddress = null;
      }
      this.updateContractUI();
      this.updateMintControlsUI();
    } catch (e) {
      this.contractAddress = null;
      this.updateContractUI();
      this.updateMintControlsUI();
    }
  }

  async loadTokens() {
    try {
      const res = await fetch('assets/tokens_manifest.json');
      this.tokens = await res.json();
      this.filteredTokens = [...this.tokens];
      this.renderGallery();
    } catch (e) {
      console.warn("Falling back to sample tokens", e);
    }
  }

  // ==========================================
  // Web3 Wallet & GIWA Sepolia Testnet
  // ==========================================
  initWeb3Listeners() {
    const btnWallet = document.getElementById('btn-connect-wallet');
    const pillNetwork = document.getElementById('network-pill');

    if (btnWallet) {
      btnWallet.addEventListener('click', () => this.handleWalletButtonClick());
    }

    if (pillNetwork) {
      pillNetwork.addEventListener('click', () => this.switchToGiwaTestnet());
    }

    // Auto-detect wallet if already authorized
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          this.disconnectWallet();
        } else {
          this.userAddress = accounts[0];
          this.updateWalletUI();
          this.checkOnChainHoldings();
        }
      });

      window.ethereum.on('chainChanged', (chainId) => {
        this.currentChainId = parseInt(chainId, 16);
        this.updateNetworkUI();
      });

      // Quick check if already connected
      window.ethereum.request({ method: 'eth_accounts' }).then(accounts => {
        if (accounts && accounts.length > 0) {
          this.connectWallet(false);
        }
      }).catch(() => {});
    }
  }

  async handleWalletButtonClick() {
    if (this.userAddress) {
      this.disconnectWallet();
    } else {
      await this.connectWallet(true);
    }
  }

  async connectWallet(showPrompts = true) {
    if (!window.ethereum) {
      this.showToast("No Ethereum wallet found! Please install MetaMask or Rabby.", 'error');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (!accounts || accounts.length === 0) return;

      this.userAddress = accounts[0];

      // Setup Ethers Provider
      if (window.ethers) {
        this.provider = new ethers.BrowserProvider(window.ethereum);
        this.signer = await this.provider.getSigner();
      }

      // Check Chain ID
      const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
      this.currentChainId = parseInt(chainIdHex, 16);

      this.updateWalletUI();
      this.updateNetworkUI();
      this.updateContractUI();

      if (this.currentChainId !== ROBINHOOD_MAINNET_PARAMS.chainIdDec) {
        if (showPrompts) {
          await this.switchToRobinhoodChain(true);
        }
      } else {
        this.showToast(`Connected to Robinhood Chain! Wallet: ${this.userAddress.slice(0, 6)}...${this.userAddress.slice(-4)}`, 'success');
      }

      await this.checkOnChainHoldings();
    } catch (err) {
      console.error("Wallet connection error:", err);
      this.showToast(`Wallet connection failed: ${err.message}`, 'error');
    }
  }

  disconnectWallet() {
    this.userAddress = null;
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.walletTokens = [];
    this.updateWalletUI();
    this.updateNetworkUI();
    if (window.loreBattle) {
      window.loreBattle.syncWalletChampions();
    }
    this.showToast("Wallet disconnected.", 'info');
  }

  updateWalletUI() {
    const btnWallet = document.getElementById('btn-connect-wallet');
    const elCounter = document.getElementById('wallet-holdings-count');

    if (btnWallet) {
      if (this.userAddress) {
        const shortAddr = `${this.userAddress.slice(0, 6)}...${this.userAddress.slice(-4)}`;
        btnWallet.innerText = `🦊 ${shortAddr}`;
        btnWallet.title = `Connected: ${this.userAddress}\nClick to disconnect`;
      } else {
        btnWallet.innerText = "Connect Wallet";
        btnWallet.title = "Connect your Web3 wallet";
      }
    }

    if (elCounter) {
      elCounter.innerText = `${this.walletTokens.length} Guardians`;
    }

    if (typeof this.updateMintControlsUI === 'function') {
      this.updateMintControlsUI();
    }

    if (window.loreBattle) {
      window.loreBattle.syncWalletChampions();
    }
  }

  updateNetworkUI() {
    const pill = document.getElementById('network-pill');
    const nameEl = document.getElementById('network-name');
    if (!pill || !nameEl) return;

    if (!this.userAddress) {
      pill.className = 'network-badge';
      nameEl.innerText = 'Robinhood Chain';
    } else if (this.currentChainId === ROBINHOOD_MAINNET_PARAMS.chainIdDec) {
      pill.className = 'network-badge';
      nameEl.innerText = '🟢 Robinhood Mainnet (4663)';
    } else if (this.currentChainId === ROBINHOOD_TESTNET_PARAMS.chainIdDec) {
      pill.className = 'network-badge';
      nameEl.innerText = '🟢 Robinhood Testnet (46630)';
    } else if (this.currentChainId === GIWA_CHAIN_ID_DEC) {
      pill.className = 'network-badge';
      nameEl.innerText = '🟢 GIWA Sepolia (91342)';
    } else {
      pill.className = 'network-badge wrong-network';
      nameEl.innerText = '⚠️ Switch to Robinhood Chain';
    }

    pill.style.cursor = 'pointer';
    pill.onclick = () => this.switchToRobinhoodChain(false);
  }

  async switchToRobinhoodChain(isMainnet = false) {
    if (!window.ethereum) {
      this.showToast("Please install MetaMask, Rabby, or Robinhood Wallet.", 'info');
      return;
    }
    const targetNet = isMainnet ? ROBINHOOD_MAINNET_PARAMS : ROBINHOOD_TESTNET_PARAMS;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetNet.chainIdHex }]
      });
      this.currentChainId = targetNet.chainIdDec;
      this.updateNetworkUI();
      this.showToast(`Switched to ${targetNet.chainName}!`, 'success');
    } catch (switchError) {
      if (switchError.code === 4902 || switchError.code === -32603) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: targetNet.chainIdHex,
              chainName: targetNet.chainName,
              nativeCurrency: targetNet.nativeCurrency,
              rpcUrls: targetNet.rpcUrls,
              blockExplorerUrls: targetNet.blockExplorerUrls
            }]
          });
          this.currentChainId = targetNet.chainIdDec;
          this.updateNetworkUI();
          this.showToast(`${targetNet.chainName} added to your wallet!`, 'success');
        } catch (addError) {
          console.error("Failed to add network:", addError);
          this.showToast("Could not add network: " + addError.message, 'error');
        }
      } else {
        console.error("Failed to switch chain:", switchError);
      }
    }
  }

  // ==========================================
  // Smart Contract Management on GIWA
  // ==========================================
  initContractManagementUI() {
    const btnDeploy = document.getElementById('btn-deploy-contract');
    const btnCustom = document.getElementById('btn-custom-contract');

    if (btnDeploy) {
      btnDeploy.addEventListener('click', () => this.deployContractToRobinhood());
    }

    if (btnCustom) {
      btnCustom.addEventListener('click', () => this.setCustomContractPrompt());
    }

    const btnFix = document.getElementById('btn-fix-mint-price');
    if (btnFix) {
      btnFix.addEventListener('click', () => this.fixActiveContractPrice());
    }

    const btnUri = document.getElementById('btn-update-base-uri');
    if (btnUri) {
      btnUri.addEventListener('click', () => this.updateContractBaseURI());
    }

    this.updateContractUI();
  }

  getContract(requireSigner = false) {
    if (!this.contractAddress || !this.contractArtifact || !window.ethers) return null;
    let runner;
    if (requireSigner) {
      runner = this.signer;
      if (!runner) return null;
    } else {
      runner = this.signer || this.provider || new ethers.JsonRpcProvider(ROBINHOOD_MAINNET_PARAMS.rpcUrls[0]);
    }
    return new ethers.Contract(this.contractAddress, this.contractArtifact.abi, runner);
  }

  updateContractUI() {
    const addrEl = document.getElementById('active-contract-addr');
    const linkEl = document.getElementById('active-contract-link');
    const badgeEl = document.getElementById('contract-status-badge');
    const btnDeploy = document.getElementById('btn-deploy-contract');
    const btnCustom = document.getElementById('btn-custom-contract');
    const btnFix = document.getElementById('btn-fix-mint-price');
    const btnUri = document.getElementById('btn-update-base-uri');
    const deployControls = document.querySelector('.contract-actions');

    if (this.contractAddress) {
      if (addrEl) addrEl.innerText = `Contract: ${this.contractAddress.slice(0, 6)}...${this.contractAddress.slice(-4)}`;
      if (linkEl) {
        linkEl.href = `${ROBINHOOD_MAINNET_PARAMS.blockExplorerUrls[0]}/address/${this.contractAddress}`;
        linkEl.style.display = 'inline-block';
      }
      if (badgeEl) {
        badgeEl.innerText = "🟢 Contract Live on Robinhood Chain";
        badgeEl.style.borderColor = "#34c759";
        badgeEl.style.color = "#34c759";
      }
      if (btnDeploy) {
        btnDeploy.style.display = 'inline-block';
        btnDeploy.innerText = "🚀 1-Click Deploy OpenSea-Ready Contract (Auto-Mints Token #1)";
      }
      if (btnCustom) btnCustom.style.display = 'inline-block';
      if (deployControls) deployControls.style.display = 'flex';

      // Initialize Ethers contract instance (with fallback public RPC)
      if (this.contractArtifact) {
        this.contract = this.getContract();
        this.refreshContractOnChainInfo();
      }
    } else {
      if (addrEl) addrEl.innerText = "No contract deployed on Robinhood Chain yet. Click '1-Click Deploy' below!";
      if (linkEl) linkEl.style.display = 'none';
      if (btnFix) btnFix.style.display = 'none';
      if (btnDeploy) {
        btnDeploy.style.display = 'inline-block';
        btnDeploy.innerText = "🚀 1-Click Deploy OpenSea-Ready Contract (Auto-Mints Token #1)";
      }
      if (btnCustom) btnCustom.style.display = 'inline-block';
      if (deployControls) deployControls.style.display = 'flex';
      if (badgeEl) {
        badgeEl.innerText = "🟡 Ready to Deploy to Robinhood Chain (0.0005 ETH Mint)";
        badgeEl.style.borderColor = "#d4af37";
        badgeEl.style.color = "#d4af37";
      }
    }
  }

  async refreshContractOnChainInfo() {
    if (!this.contract) return;
    const btnFix = document.getElementById('btn-fix-mint-price');
    try {
      const priceBn = await this.contract.mintPrice();
      this.mintPriceEth = parseFloat(ethers.formatEther(priceBn));
      const singlePriceEl = document.getElementById('mint-single-price');
      if (singlePriceEl) singlePriceEl.innerText = `${this.mintPriceEth} ETH`;
      const totalEth = document.getElementById('mint-total-eth');
      if (totalEth) totalEth.innerText = (this.currentMintQty * this.mintPriceEth).toFixed(4) + " ETH";
    } catch (e) {}

    try {
      const treasuryAddr = await this.contract.treasury();
      this.treasuryAddress = treasuryAddr;
      const tributeRecipientEl = document.getElementById('tribute-recipient-addr');
      if (tributeRecipientEl) {
        tributeRecipientEl.innerText = `${treasuryAddr.slice(0, 6)}...${treasuryAddr.slice(-4)}`;
        tributeRecipientEl.title = treasuryAddr;
      }
    } catch (e) {}

    if (this.userAddress) {
      try {
        const owner = await this.contract.owner();
        const isOwner = (owner.toLowerCase() === this.userAddress.toLowerCase());
        if (btnFix) {
          btnFix.style.display = isOwner ? 'inline-block' : 'none';
        }
      } catch (e) {}
    }
  }

  async updateContractBaseURI(customUri = null) {
    if (!this.contractAddress || !this.signer) {
      this.showToast("Please connect your wallet first.", 'error');
      await this.connectWallet(true);
      return;
    }
    const targetUri = customUri || "https://ndmapdbelapz.github.io/mythical-guardians-nft/metadata/json/";
    const btn = document.getElementById('btn-update-base-uri');
    try {
      if (btn) { btn.disabled = true; btn.innerText = "Broadcasting to Robinhood Chain..."; }
      this.showToast(`Setting Base URI to GitHub Pages... Confirm in wallet.`, "info");

      const contract = new ethers.Contract(this.contractAddress, this.contractArtifact.abi, this.signer);
      const owner = await contract.owner();
      if (owner.toLowerCase() !== this.userAddress.toLowerCase()) {
        this.showToast(`Only the contract owner (${owner.slice(0, 6)}...${owner.slice(-4)}) can update Base URI.`, "error");
        return;
      }

      const tx = await contract.setBaseURI(targetUri);
      const expUrl = ROBINHOOD_MAINNET_PARAMS.blockExplorerUrls[0];
      this.showToast(`Base URI tx sent! Hash: ${tx.hash.slice(0, 10)}...`, "info", `${expUrl}/tx/${tx.hash}`);
      await tx.wait();
      this.showToast(`✅ Base URI set to GitHub Pages! OpenSea can now load your art & traits.`, "success");
    } catch (err) {
      console.error(err);
      this.showToast("Could not update Base URI: " + err.message, "error");
    } finally {
      if (btn) { btn.disabled = false; btn.innerText = "🌐 Set Metadata Base URI for OpenSea"; }
    }
  }

  async fixActiveContractPrice() {
    if (!this.contractAddress || !this.signer) {
      this.showToast("Please connect your wallet first.", 'error');
      return;
    }
    const btn = document.getElementById('btn-fix-mint-price');
    try {
      if (btn) { btn.disabled = true; btn.innerText = "Adjusting on Robinhood Chain..."; }
      this.showToast("Lowering mint price to 0.0005 ETH... Confirm in wallet.", "info");

      const contract = new ethers.Contract(this.contractAddress, this.contractArtifact.abi, this.signer);
      const tx = await contract.setMintPrice(ethers.parseEther("0.0005"));
      const expUrl = ROBINHOOD_MAINNET_PARAMS.blockExplorerUrls[0];
      this.showToast(`Adjustment tx broadcast! ${tx.hash.slice(0, 10)}...`, "info", `${expUrl}/tx/${tx.hash}`);
      await tx.wait();

      try {
        if (typeof contract.setTreasury === 'function') {
          const txTreasury = await contract.setTreasury(DESTINATION_PAYOUT_WALLET);
          await txTreasury.wait();
        }
      } catch (tErr) {}

      this.mintPriceEth = 0.0005;
      await this.refreshContractOnChainInfo();
      this.showToast("✅ Active contract mint price lowered to 0.0005 ETH!", "success");
    } catch (err) {
      console.error(err);
      this.showToast("Could not adjust price: " + err.message, "error");
    } finally {
      if (btn) { btn.disabled = false; btn.innerText = "🔧 Set Active Contract Price to 0.0005 ETH"; }
    }
  }

  async deployContractToRobinhood() {
    if (!this.userAddress) {
      this.showToast("Please connect your wallet first to deploy the contract.", 'info');
      await this.connectWallet(true);
      if (!this.userAddress) return;
    }

    // Always reload latest compiled artifact before deploying
    await this.loadContractArtifact();

    if (!this.contractArtifact || !this.contractArtifact.bytecode) {
      this.showToast("Contract bytecode not loaded! Please compile contracts first.", 'error');
      return;
    }

    if (this.currentChainId !== ROBINHOOD_MAINNET_PARAMS.chainIdDec) {
      await this.switchToRobinhoodChain(true);
      if (this.currentChainId !== ROBINHOOD_MAINNET_PARAMS.chainIdDec) {
        this.showToast("Please switch to Robinhood Chain Mainnet (4663) in MetaMask.", 'error');
        return;
      }
    }

    const netName = ROBINHOOD_MAINNET_PARAMS.chainName;
    const expUrl = ROBINHOOD_MAINNET_PARAMS.blockExplorerUrls[0];
    const rpcUrl = ROBINHOOD_MAINNET_PARAMS.rpcUrls[0];
    const cId = ROBINHOOD_MAINNET_PARAMS.chainIdDec;

    const btnDeploy = document.getElementById('btn-deploy-contract');
    const btnMint = document.getElementById('btn-summon-action');

    try {
      if (btnDeploy) {
        btnDeploy.disabled = true;
        btnDeploy.innerText = `Broadcasting to ${netName}...`;
      }
      if (btnMint) {
        btnMint.disabled = true;
        btnMint.innerText = `Broadcasting to ${netName}...`;
      }

      const payoutWallet = this.userAddress || DESTINATION_PAYOUT_WALLET;
      this.showToast(`Deploying OpenSea-Ready Contract (auto-mints Genesis Token #1 to ${payoutWallet.slice(0, 8)}...) — Confirm in wallet.`, 'info');

      const runner = this.signer || (await this.provider.getSigner());
      const factory = new ethers.ContractFactory(
        this.contractArtifact.abi,
        this.contractArtifact.bytecode,
        runner
      );

      const baseURI = "https://ndmapdbelapz.github.io/mythical-guardians-nft/metadata/json/";
      const contract = await factory.deploy(
        "Mythical Beasts & Guardians",
        "MYTH",
        baseURI,
        payoutWallet
      );

      const txHash = contract.deploymentTransaction()?.hash;
      this.showToast(`Deployment broadcast! Hash: ${txHash?.slice(0, 10)}...`, 'info', `${expUrl}/tx/${txHash}`, `View Tx on ${netName} ↗`);

      if (btnDeploy) btnDeploy.innerText = "Waiting for Block Confirmation on Robinhood Chain...";
      if (btnMint) btnMint.innerText = "Waiting for Block Confirmation on Robinhood Chain...";

      await contract.waitForDeployment();

      const newAddress = await contract.getAddress();
      this.contractAddress = newAddress;
      localStorage.setItem('robinhood_mythic_contract', newAddress);

      // Save to server
      try {
        await fetch('/api/contract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address: newAddress,
            network: netName,
            chainId: cId,
            rpcUrl: rpcUrl,
            explorerUrl: expUrl,
            treasury: payoutWallet,
            deployer: this.userAddress,
            deployedAt: new Date().toISOString()
          })
        });
      } catch (err) {}

      this.walletTokens = [1];
      this.updateContractUI();
      this.updateMintControlsUI();
      await this.checkOnChainHoldings();
      this.showToast(
        `🎉 Deployed & Minted Genesis Token #1! Contract: ${newAddress.slice(0, 8)}...`,
        'success',
        `https://opensea.io/item/robinhood/${newAddress}/1`,
        `🌊 View Token #1 on OpenSea ↗`
      );
    } catch (err) {
      console.error("Deployment failed:", err);
      this.showToast(`Deployment failed: ${err.message}`, 'error');
    } finally {
      if (btnDeploy) {
        btnDeploy.disabled = false;
        btnDeploy.innerText = "🚀 1-Click Deploy OpenSea-Ready Contract (Auto-Mints Token #1)";
      }
      this.updateMintControlsUI();
    }
  }

  setCustomContractPrompt() {
    const input = prompt("Enter the MythicalGuardiansNFT contract address on Robinhood Chain Mainnet:", this.contractAddress || "");
    if (input && input.startsWith("0x") && input.length === 42) {
      this.contractAddress = input.trim();
      localStorage.setItem('robinhood_mythic_contract', this.contractAddress);
      fetch('/api/contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: this.contractAddress,
          network: "Robinhood Chain Mainnet",
          chainId: ROBINHOOD_MAINNET_PARAMS.chainIdDec,
          rpcUrl: ROBINHOOD_MAINNET_PARAMS.rpcUrls[0],
          explorerUrl: ROBINHOOD_MAINNET_PARAMS.blockExplorerUrls[0],
          treasury: DESTINATION_PAYOUT_WALLET
        })
      }).catch(() => {});
      this.walletTokens = [];
      this.updateContractUI();
      this.updateMintControlsUI();
      this.showToast(`Set active contract to ${this.contractAddress}`, 'success');
      this.checkOnChainHoldings();
    } else if (input) {
      this.showToast("Invalid Ethereum contract address format.", 'error');
    }
  }

  async checkOnChainHoldings(silent = false) {
    if (!this.userAddress || !this.contractAddress || !this.contractArtifact) return;

    try {
      const runner = this.signer || this.provider;
      if (!runner) return;
      const contract = new ethers.Contract(this.contractAddress, this.contractArtifact.abi, runner);

      // Query on-chain tokens owned by user
      try {
        if (typeof contract.tokensOfOwner === 'function') {
          const tokenIds = await contract.tokensOfOwner(this.userAddress);
          const onChainIds = new Set((tokenIds || []).map(t => Number(t)));

          // Add any on-chain tokens not yet in walletTokens
          for (const tid of onChainIds) {
            if (!this.walletTokens.some(t => Number(t.id) === tid)) {
              const found = this.tokens.find(t => Number(t.id) === tid) || {
                id: tid,
                name: `Guardian #${String(tid).padStart(4, '0')}`,
                archetype: "Mythical Guardian",
                element: "Fire",
                power: 80,
                tier: "Rare",
                image: `assets/tokens/${tid}.svg`
              };
              this.walletTokens.push(found);
            }
          }

          // Retain tokens that are confirmed on-chain OR added optimistically within the last 20 seconds
          this.walletTokens = this.walletTokens.filter(t => {
            if (onChainIds.has(Number(t.id))) return true;
            if (t._optimistic && (Date.now() - t._optimistic < 20000)) return true;
            return false;
          });

          this.updateWalletUI();
          this.updateAltarStatus();
          if (typeof this.renderMarketplaceGrids === 'function') {
            this.renderMarketplaceGrids();
          }
        }
      } catch (eEnum) {}

      const balanceBn = await contract.balanceOf(this.userAddress);
      const balance = Number(balanceBn);

      if (balance > 0 && !silent) {
        this.showToast(`Connected wallet holds ${balance} Guardian(s) on Robinhood Chain!`, 'info');
      }
    } catch (e) {
      console.warn("Could not query on-chain balance:", e);
    }
  }

  // ==========================================
  // Minting Engine (Robinhood Chain Mainnet)
  // ==========================================
  updateMintControlsUI() {
    const qtyText = document.getElementById('mint-qty-text');
    const totalEth = document.getElementById('mint-total-eth');
    const limitStatusEl = document.getElementById('mint-wallet-limit-status');
    const btnMint = document.getElementById('btn-summon-action');
    const btnInc = document.getElementById('btn-mint-inc');
    const btnDec = document.getElementById('btn-mint-dec');

    const maxPerWallet = 5;
    const ownedCount = (this.userAddress && this.contractAddress) ? this.walletTokens.length : 0;
    const remainingToMint = Math.max(0, maxPerWallet - ownedCount);

    if (limitStatusEl) {
      const limitLbl = document.getElementById('mint-wallet-limit-lbl');
      if (!this.userAddress || !this.contractAddress) {
        limitStatusEl.innerHTML = `<span style="color:var(--gold-light); font-weight:700;">Max 5</span>`;
        if (limitLbl) limitLbl.innerText = 'Wallet Limit';
      } else if (ownedCount >= maxPerWallet) {
        limitStatusEl.innerHTML = `<span style="color:#ff5252; font-weight:800;">5 / 5</span>`;
        if (limitLbl) limitLbl.innerText = 'Limit Reached';
      } else {
        limitStatusEl.innerHTML = `<span style="color:#34c759; font-weight:800;">${ownedCount} / 5</span>`;
        if (limitLbl) limitLbl.innerText = `${remainingToMint} Left`;
      }
    }

    if (btnMint) {
      if (!this.contractAddress) {
        btnMint.disabled = false;
        btnMint.innerText = '🚀 1-Click Deploy OpenSea-Ready Contract (Auto-Mints Token #1)';
        btnMint.style.opacity = '1';
        btnMint.style.cursor = 'pointer';
      } else if (this.userAddress && ownedCount >= maxPerWallet) {
        btnMint.disabled = true;
        btnMint.innerText = 'Max Limit Reached (5/5 Minted)';
        btnMint.style.opacity = '0.55';
        btnMint.style.cursor = 'not-allowed';
      } else {
        btnMint.disabled = false;
        btnMint.innerText = '⚡ Summon Guardian';
        btnMint.style.opacity = '1';
        btnMint.style.cursor = 'pointer';
      }
    }

    if (remainingToMint > 0) {
      this.currentMintQty = Math.min(this.currentMintQty, remainingToMint);
      if (this.currentMintQty < 1) this.currentMintQty = 1;
    } else {
      this.currentMintQty = 1;
    }

    if (qtyText) qtyText.innerText = this.currentMintQty;
    if (totalEth) totalEth.innerText = (this.currentMintQty * this.mintPriceEth).toFixed(4) + " ETH";

    if (btnInc) {
      btnInc.disabled = (this.currentMintQty >= remainingToMint || remainingToMint === 0);
    }
    if (btnDec) {
      btnDec.disabled = (this.currentMintQty <= 1);
    }
  }

  initMintControls() {
    const btnDec = document.getElementById('btn-mint-dec');
    const btnInc = document.getElementById('btn-mint-inc');
    const btnMint = document.getElementById('btn-summon-action');

    const maxPerWallet = 5;

    if (btnDec) {
      btnDec.addEventListener('click', () => {
        if (this.currentMintQty > 1) {
          this.currentMintQty--;
          this.updateMintControlsUI();
        }
      });
    }

    if (btnInc) {
      btnInc.addEventListener('click', () => {
        const ownedCount = (this.userAddress && this.contractAddress) ? this.walletTokens.length : 0;
        const remainingToMint = Math.max(0, maxPerWallet - ownedCount);

        if (this.userAddress && remainingToMint <= 0) {
          this.showToast("Wallet limit reached: You already have 5 Guardians in this wallet.", 'error');
          return;
        }

        if (this.currentMintQty < remainingToMint) {
          this.currentMintQty++;
          this.updateMintControlsUI();
        } else {
          this.showToast(`Wallet limit reached: Maximum 5 Guardians allowed per wallet (${ownedCount}/5 owned).`, 'error');
        }
      });
    }

    if (btnMint) {
      btnMint.addEventListener('click', () => this.executeMint());
    }

    this.updateMintControlsUI();
  }

  async executeMint() {
    if (!this.userAddress) {
      this.showToast("Please connect your wallet first to summon Guardians.", 'info');
      await this.connectWallet(true);
      return;
    }

    if (this.currentChainId !== ROBINHOOD_MAINNET_PARAMS.chainIdDec) {
      await this.switchToRobinhoodChain(true);
      if (this.currentChainId !== ROBINHOOD_MAINNET_PARAMS.chainIdDec) {
        this.showToast("Please switch to Robinhood Chain Mainnet (4663) in MetaMask.", 'error');
        return;
      }
    }

    if (!this.contractAddress) {
      await this.deployContractToRobinhood();
      return;
    }

    // STRICT 5-PER-WALLET LIMIT ENFORCEMENT
    const maxPerWallet = 5;
    const ownedCount = this.walletTokens.length;

    if (ownedCount >= maxPerWallet) {
      this.showToast("Wallet limit reached: Maximum 5 Guardians allowed per wallet.", 'error');
      this.updateMintControlsUI();
      return;
    }

    if (ownedCount + this.currentMintQty > maxPerWallet) {
      const allowed = Math.max(1, maxPerWallet - ownedCount);
      this.showToast(`Wallet limit: You already have ${ownedCount}/5 Guardians. You can only mint ${allowed} more.`, 'error');
      this.currentMintQty = allowed;
      this.updateMintControlsUI();
      return;
    }

    const btnMint = document.getElementById('btn-summon-action');
    if (btnMint) {
      btnMint.disabled = true;
      btnMint.innerText = 'Summoning on Robinhood Chain...';
    }

    try {
      const runner = this.signer || (await this.provider.getSigner());
      const contract = new ethers.Contract(this.contractAddress, this.contractArtifact.abi, runner);

      // On-chain balance validation for 5 per wallet
      try {
        const onChainBal = Number(await contract.balanceOf(this.userAddress));
        if (onChainBal >= maxPerWallet) {
          this.showToast("Wallet limit reached: This wallet already owns 5 Guardians on-chain.", 'error');
          this.updateMintControlsUI();
          return;
        }
        if (onChainBal + this.currentMintQty > maxPerWallet) {
          const allowed = Math.max(1, maxPerWallet - onChainBal);
          this.showToast(`Wallet limit: You own ${onChainBal}/5 on-chain. You can only mint ${allowed} more.`, 'error');
          this.currentMintQty = allowed;
          this.updateMintControlsUI();
          return;
        }
      } catch (eBal) {}

      // 1. Fetch on-chain mint price
      let mintPriceBn;
      try {
        mintPriceBn = await contract.mintPrice();
      } catch (e) {
        mintPriceBn = ethers.parseEther(String(this.mintPriceEth || "0.0005"));
      }

      const totalValue = mintPriceBn * BigInt(this.currentMintQty);

      // 2. Pre-flight check: User wallet balance
      const balance = await this.provider.getBalance(this.userAddress);

      if (balance < totalValue) {
        const userEth = ethers.formatEther(balance);
        const reqEth = ethers.formatEther(totalValue);
        this.showToast(`Insufficient ETH balance on Robinhood Chain (Balance: ${userEth} ETH, Required: ${reqEth} ETH).`, 'error');
        return;
      }

      this.showToast(`Submitting summon for ${this.currentMintQty} Guardian(s)... Total: ${ethers.formatEther(totalValue)} ETH. Confirm in MetaMask.`, 'info');

      // 3. Robust Gas Estimation with fallback
      let gasLimit;
      try {
        const estimated = await contract.summonGuardians.estimateGas(this.currentMintQty, { value: totalValue });
        gasLimit = (estimated * 130n) / 100n; // 30% safety buffer
      } catch (gasErr) {
        console.warn("Gas estimation warning, using reliable limit:", gasErr);
        gasLimit = 400000n * BigInt(this.currentMintQty);
      }

      // 4. Broadcast summonGuardians payable transaction
      const tx = await contract.summonGuardians(this.currentMintQty, {
        value: totalValue,
        gasLimit: gasLimit
      });

      const expUrl = ROBINHOOD_MAINNET_PARAMS.blockExplorerUrls[0];
      this.showToast(`Transaction broadcast to Robinhood Chain! Hash: ${tx.hash.slice(0, 10)}...`, 'info', `${expUrl}/tx/${tx.hash}`, 'View Tx on Robinhood Explorer ↗');

      if (btnMint) btnMint.innerText = 'Waiting for Confirmation on Robinhood Chain...';

      const receipt = await tx.wait();

      // 5. Parse GuardianSummoned / Transfer events
      const summonedEvents = [];
      for (const log of receipt.logs) {
        try {
          const parsed = contract.interface.parseLog(log);
          if (parsed && parsed.name === 'GuardianSummoned') {
            summonedEvents.push(parsed.args);
          }
        } catch (e) {}
      }

      const mintedList = [];
      if (summonedEvents.length > 0) {
        summonedEvents.forEach(args => {
          const tokenId = Number(args.tokenId);
          const beastIdx = Number(args.beastType);
          const elIdx = Number(args.element);
          const pRating = Number(args.powerRating);

          const archName = ARCHETYPE_NAMES[beastIdx] || "Mythical Guardian";
          const elName = ELEMENT_NAMES[elIdx] || "Fire";

          const tokenObj = {
            id: tokenId,
            name: `${archName} #${String(tokenId).padStart(4, '0')}`,
            archetype: archName,
            element: elName,
            power: pRating,
            tier: pRating >= 90 ? "Mythic" : pRating >= 80 ? "Legendary" : "Epic",
            image: `assets/tokens/${tokenId}.svg`,
            _optimistic: Date.now()
          };
          this.walletTokens.push(tokenObj);
          mintedList.push(tokenObj);
        });
      } else {
        // Fallback for UI visualization
        for (let i = 0; i < this.currentMintQty; i++) {
          const randomToken = this.tokens[Math.floor(Math.random() * this.tokens.length)] || {};
          const cloned = JSON.parse(JSON.stringify(randomToken));
          cloned.id = 2200 + this.walletTokens.length + 1;
          cloned._optimistic = Date.now();
          this.walletTokens.push(cloned);
          mintedList.push(cloned);
        }
      }

      this.updateWalletUI();
      this.updateAltarStatus();
      this.updateMintControlsUI();
      if (typeof this.renderMarketplaceGrids === 'function') {
        this.renderMarketplaceGrids();
      }

      this.showToast(`🎉 SUMMON SUCCESSFUL! Minted ${mintedList.length} Guardian(s) on Robinhood Chain!`, 'success', `${expUrl}/tx/${tx.hash}`, 'View Receipt on Robinhood Explorer ↗');

    } catch (err) {
      console.error("Minting failed:", err);
      if (err.code === 'ACTION_REJECTED' || err.code === 4001) {
        this.showToast("Transaction was cancelled in wallet.", 'info');
      } else {
        this.showToast(`Summoning failed: ${err.message}`, 'error');
      }
    } finally {
      this.updateMintControlsUI();
    }
  }

  // ==========================================
  // The Pentagonal Altar (Companion Awakening)
  // ==========================================
  updateAltarStatus() {
    const elements = ["Fire", "Water", "Earth", "Air", "Void"];
    const foundElements = {};

    elements.forEach(el => {
      const match = this.walletTokens.find(t => (t.element === el || t.properties?.element_name === el));
      foundElements[el] = match || null;
    });

    elements.forEach(el => {
      const slotEl = document.getElementById(`slot-${el.toLowerCase()}`);
      if (!slotEl) return;

      const token = foundElements[el];
      if (token) {
        const imgSrc = token.image || `assets/tokens/${token.id}.svg`;
        slotEl.className = `altar-slot active ${el.toLowerCase()}`;
        slotEl.style.cursor = 'pointer';
        slotEl.title = `Active: ${token.name} (${el}) - Click to inspect`;
        slotEl.innerHTML = `
          <img src="${imgSrc}" alt="${token.name}" />
          <div class="slot-label" style="color:var(--${el.toLowerCase()}-color)">${el}</div>
          <div class="slot-status">#${token.id || '01'} Active</div>
        `;
        slotEl.onclick = () => this.openInspectorModal(token);
      } else {
        slotEl.className = `altar-slot`;
        slotEl.style.cursor = 'pointer';
        slotEl.title = `Missing ${el} Element! Summon more Guardians in the Summon Portal`;
        slotEl.innerHTML = `
          <div style="font-size: 26px; margin-bottom: 4px;">⛩️</div>
          <div class="slot-label">${el}</div>
          <div class="slot-status">Empty (Find ${el})</div>
        `;
        slotEl.onclick = () => {
          this.switchTab('tab-mint');
          this.showToast(`Summon more Guardians in the Summon Portal to unlock the ${el} Element!`, 'info');
        };
      }
    });

    const activeCount = Object.values(foundElements).filter(Boolean).length;
    const coreBtn = document.getElementById('altar-core-trigger');
    const statusText = document.getElementById('altar-status-desc');

    if (activeCount === 5) {
      if (coreBtn) {
        coreBtn.classList.add('ready');
        coreBtn.innerHTML = `
          <div style="font-size:28px;">🌟</div>
          <span>AWAKEN COMPANION</span>
        `;
        coreBtn.onclick = () => this.performAltarAwakening();
      }
      if (statusText) {
        statusText.innerHTML = `✨ <strong>THE FIVE SACRED ELEMENTS ARE CONVERGED!</strong> Click the central core to awaken your Celestial Companion.`;
      }
    } else {
      if (coreBtn) {
        coreBtn.classList.remove('ready');
        coreBtn.innerHTML = `
          <div style="font-size:24px;">🔮</div>
          <span>${activeCount} / 5 Spheres</span>
        `;
        coreBtn.onclick = () => {
          this.showToast(`You need all 5 Elements (Fire, Water, Earth, Air, Void) to awaken a companion. Currently have: ${activeCount}/5.`, 'info');
        };
      }
      if (statusText) {
        statusText.innerText = `Gather Fire, Water, Earth, Air, and Void guardians to activate the Celestial Awakening ritual.`;
      }
    }
  }

  performAltarAwakening() {
    if (window.mythicAudio) window.mythicAudio.playRitualAwakeningSound();

    this.hasCompanionAwakened = true;
    const companionCard = document.getElementById('companion-reveal-box');
    if (companionCard) {
      companionCard.style.display = 'block';
      companionCard.scrollIntoView({ behavior: 'smooth' });
    }

    if (window.loreBattle) {
      window.loreBattle.companionBonusUnlocked = true;
      if (window.loreBattle.btnAwakened) {
        window.loreBattle.btnAwakened.disabled = false;
      }
    }

    this.showToast("🌟 Celestial Awakening Complete! Your companion grants True Celestial Damage.", 'success');
  }

  // ==========================================
  // OpenSea-Style Decentralized Marketplace
  // ==========================================
  showMarketBrowseTab() {
    const btnBrowse = document.getElementById('btn-market-browse');
    const btnSell = document.getElementById('btn-market-sell');
    const browsePanel = document.getElementById('market-browse-panel');
    const sellPanel = document.getElementById('market-sell-panel');
    if (btnBrowse && btnSell) {
      btnBrowse.className = 'btn-gold';
      btnSell.className = 'btn-outline';
      if (browsePanel) browsePanel.style.display = 'block';
      if (sellPanel) sellPanel.style.display = 'none';
      this.renderMarketplaceGrids();
    }
  }

  showMarketSellTab() {
    const btnBrowse = document.getElementById('btn-market-browse');
    const btnSell = document.getElementById('btn-market-sell');
    const browsePanel = document.getElementById('market-browse-panel');
    const sellPanel = document.getElementById('market-sell-panel');
    if (btnBrowse && btnSell) {
      btnSell.className = 'btn-gold';
      btnBrowse.className = 'btn-outline';
      if (sellPanel) sellPanel.style.display = 'block';
      if (browsePanel) browsePanel.style.display = 'none';
      this.renderMarketplaceGrids();
    }
  }

  initMarketplaceUI() {
    const btnBrowse = document.getElementById('btn-market-browse');
    const btnSell = document.getElementById('btn-market-sell');
    const btnRefresh = document.getElementById('btn-market-refresh');

    if (btnBrowse) {
      btnBrowse.addEventListener('click', () => this.showMarketBrowseTab());
    }

    if (btnSell) {
      btnSell.addEventListener('click', () => this.showMarketSellTab());
    }

    if (btnRefresh) {
      btnRefresh.addEventListener('click', async () => {
        this.showToast("Refreshing marketplace listings from blockchain...", 'info');
        await this.renderMarketplace(true);
        this.showToast("Marketplace listings updated!", 'success');
      });
    }
  }

  async fetchActiveListings() {
    const contract = this.getContract();
    if (!contract) return;
    try {
      if (typeof contract.getActiveListings === 'function') {
        const res = await contract.getActiveListings();
        const tokenIds = res[0] || [];
        const prices = res[1] || [];
        const sellers = res[2] || [];

        const onChainListings = [];
        const onChainIdSet = new Set();

        for (let i = 0; i < tokenIds.length; i++) {
          const tid = Number(tokenIds[i]);
          onChainIdSet.add(tid);

          // If this token was optimistically cancelled or bought in the last 30s, do NOT include stale RPC listing
          if (this.optimisticRemovedListings && this.optimisticRemovedListings[tid] && (Date.now() - this.optimisticRemovedListings[tid] < 30000)) {
            continue;
          }

          const priceWei = prices[i];
          const seller = sellers[i];
          const tokenMeta = this.tokens.find(t => Number(t.id) === tid) || {
            id: tid,
            name: `Guardian #${String(tid).padStart(4, '0')}`,
            element: "Fire",
            tier: "Rare",
            power: 80,
            image: `assets/tokens/${tid}.svg`
          };
          onChainListings.push({
            token: tokenMeta,
            tokenId: tid,
            priceWei: priceWei,
            priceEth: ethers.formatEther(priceWei),
            seller: seller
          });
        }

        // Also preserve any listings that were optimistically added in the last 30s but not yet in RPC
        const finalActiveListings = [...onChainListings];
        for (const localItem of (this.activeListings || [])) {
          const tid = Number(localItem.tokenId);
          if (!onChainIdSet.has(tid) && localItem._optimistic && (Date.now() - localItem._optimistic < 30000)) {
            if (!this.optimisticRemovedListings || !this.optimisticRemovedListings[tid] || (Date.now() - this.optimisticRemovedListings[tid] >= 30000)) {
              finalActiveListings.push(localItem);
            }
          }
        }

        this.activeListings = finalActiveListings;
      }
    } catch (e) {
      console.warn("Could not fetch active listings:", e);
    }
  }

  renderMarketplaceGrids() {
    const listingsGrid = document.getElementById('market-listings-grid');
    const myNftsGrid = document.getElementById('market-my-nfts-grid');
    const listingsCountEl = document.getElementById('market-listings-count');
    const myNftsCountEl = document.getElementById('market-my-nfts-count');

    if (listingsCountEl) {
      listingsCountEl.innerText = this.activeListings.length;
    }

    if (myNftsCountEl) {
      myNftsCountEl.innerText = this.walletTokens.length;
    }

    // Render Browse Panel
    if (listingsGrid) {
      if (this.activeListings.length === 0) {
        listingsGrid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align:center; padding:3.5rem 1rem; color:var(--text-muted);">
            <div style="font-size:3.5rem; margin-bottom:1rem;">🏪</div>
            <h3 style="color:var(--gold-light); font-size:1.4rem;">No Active Listings Currently</h3>
            <p style="margin-top:8px; max-width:480px; margin-left:auto; margin-right:auto; font-size:0.95rem;">
              Be the first collector to list a Guardian for sale on Robinhood Chain! Click "List My Guardians" above to set an asking price.
            </p>
          </div>
        `;
      } else {
        listingsGrid.innerHTML = '';
        this.activeListings.forEach(item => {
          const card = document.createElement('div');
          card.className = 'beast-card';

          const isOwner = this.userAddress && (item.seller.toLowerCase() === this.userAddress.toLowerCase());
          const sellerShort = `${item.seller.slice(0, 6)}...${item.seller.slice(-4)}`;

          card.innerHTML = `
            <img src="${item.token.image || `assets/tokens/${item.tokenId}.svg`}" alt="${item.token.name}" loading="lazy"/>
            <div class="beast-card-info">
              <div class="beast-card-header">
                <span class="beast-card-title">${item.token.name}</span>
              </div>
              <div class="beast-traits-row">
                <span class="trait-tag">● ${item.token.element || 'Fire'}</span>
                <span class="trait-tag">Seller: ${isOwner ? 'You' : sellerShort}</span>
              </div>
              <div style="margin-top:12px; padding:10px; background:rgba(212,175,55,0.08); border:1px solid rgba(212,175,55,0.25); border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <span style="font-size:0.75rem; color:var(--text-muted); display:block;">Asking Price:</span>
                  <span style="font-family:'Cinzel', serif; font-size:1.15rem; font-weight:700; color:var(--gold-light);">${item.priceEth} ETH</span>
                </div>
                ${isOwner ? `
                  <button class="btn-outline btn-cancel-listing" style="font-size:0.8rem; padding:6px 12px; color:#ff5252; border-color:#ff5252;" data-token-id="${item.tokenId}">
                    Cancel Listing
                  </button>
                ` : `
                  <button class="btn-gold btn-buy-listing" style="font-size:0.82rem; padding:8px 14px;" data-token-id="${item.tokenId}">
                    ⚡ Buy Now
                  </button>
                `}
              </div>
            </div>
          `;

          const buyBtn = card.querySelector('.btn-buy-listing');
          if (buyBtn) {
            buyBtn.addEventListener('click', () => this.buyMarketGuardian(item.tokenId, item.priceWei, item.priceEth));
          }

          const cancelBtn = card.querySelector('.btn-cancel-listing');
          if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.cancelMarketListing(item.tokenId));
          }

          listingsGrid.appendChild(card);
        });
      }
    }

    // Render User's Owned NFTs (Sell Panel)
    if (myNftsGrid) {
      if (this.walletTokens.length === 0) {
        myNftsGrid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align:center; padding:3.5rem 1rem; color:var(--text-muted);">
            <div style="font-size:3.5rem; margin-bottom:1rem;">🦊</div>
            <h3 style="color:var(--gold-light); font-size:1.4rem;">No Guardians In Your Connected Wallet</h3>
            <p style="margin-top:8px; max-width:480px; margin-left:auto; margin-right:auto; font-size:0.95rem;">
              Summon a Guardian from the Summoning Portal first to list it on the marketplace!
            </p>
            <button class="btn-gold" style="margin-top:16px; padding:10px 20px;" onclick="window.guardianApp.switchTab('tab-mint')">
              Go to Summon Portal
            </button>
          </div>
        `;
      } else {
        myNftsGrid.innerHTML = '';
        this.walletTokens.forEach(token => {
          const card = document.createElement('div');
          card.className = 'beast-card';

          const activeListing = this.activeListings.find(l => Number(l.tokenId) === Number(token.id));
          const isListed = !!activeListing;

          card.innerHTML = `
            <img src="${token.image || `assets/tokens/${token.id}.svg`}" alt="${token.name}" loading="lazy"/>
            <div class="beast-card-info">
              <div class="beast-card-header">
                <span class="beast-card-title">${token.name}</span>
              </div>
              <div class="beast-traits-row">
                <span class="trait-tag">● ${token.element || 'Fire'}</span>
                <span class="trait-tag">Power: ${token.power || 80}</span>
              </div>
              <div style="margin-top:12px; padding:10px; background:rgba(0,0,0,0.3); border-radius:8px; border:1px solid rgba(255,255,255,0.08);">
                ${isListed ? `
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                      <span style="font-size:0.75rem; color:#34c759;">🟢 Listed for:</span>
                      <div style="font-weight:700; color:var(--gold-light); font-size:1.05rem;">${activeListing.priceEth} ETH</div>
                    </div>
                    <button class="btn-outline btn-cancel-listing" style="font-size:0.78rem; padding:6px 12px; color:#ff5252; border-color:#ff5252;" data-token-id="${token.id}">
                      Cancel Listing
                    </button>
                  </div>
                ` : `
                  <div style="display:flex; gap:8px; align-items:center;">
                    <input type="number" step="0.0001" min="0.0001" placeholder="Price in ETH (e.g. 0.001)" class="market-price-input" style="width:100%; padding:8px 10px; font-size:0.85rem; border-radius:6px; border:1px solid rgba(212,175,55,0.35); background:#090b10; color:#fff;" />
                    <button class="btn-gold btn-list-action" style="font-size:0.8rem; padding:8px 14px; white-space:nowrap;" data-token-id="${token.id}">
                      🏷️ List
                    </button>
                  </div>
                `}
              </div>
            </div>
          `;

          const listBtn = card.querySelector('.btn-list-action');
          if (listBtn) {
            listBtn.addEventListener('click', () => {
              const input = card.querySelector('.market-price-input');
              const priceVal = input ? input.value : null;
              this.listMarketGuardian(token.id, priceVal);
            });
          }

          const cancelBtn = card.querySelector('.btn-cancel-listing');
          if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.cancelMarketListing(token.id));
          }

          myNftsGrid.appendChild(card);
        });
      }
    }
  }

  async renderMarketplace(fetchFromChain = true) {
    // 1. Instantly render from cached/in-memory state (<1ms, no delay)
    this.renderMarketplaceGrids();

    // 2. Fetch fresh on-chain listings and re-render
    if (fetchFromChain) {
      await this.fetchActiveListings();
      this.renderMarketplaceGrids();
    }
  }

  async listMarketGuardian(tokenId, priceEth) {
    if (!this.userAddress) {
      this.showToast("Please connect your wallet first.", 'error');
      await this.connectWallet(true);
      return;
    }

    if (!priceEth || isNaN(priceEth) || parseFloat(priceEth) <= 0) {
      this.showToast("Please enter a valid price greater than 0 ETH (e.g. 0.001).", 'error');
      return;
    }

    const numTokenId = Number(tokenId);
    const statusBox = document.getElementById('market-action-status');

    // Instant local UI feedback on the card button
    const listBtn = document.querySelector(`.btn-list-action[data-token-id="${numTokenId}"]`);
    const origBtnHtml = listBtn ? listBtn.innerHTML : '🏷️ List';
    if (listBtn) {
      listBtn.disabled = true;
      listBtn.innerHTML = '⏳ Confirming in Wallet...';
    }

    try {
      this.showToast(`Listing Guardian #${tokenId} for ${priceEth} ETH... Confirm in your wallet.`, 'info');
      if (statusBox) {
        statusBox.style.display = 'block';
        statusBox.innerHTML = `<span style="color:var(--gold-light);">⏳ Confirming listing for Guardian #${tokenId} (${priceEth} ETH) in your wallet...</span>`;
      }

      const runner = this.signer || (await this.provider.getSigner());
      const contract = new ethers.Contract(this.contractAddress, this.contractArtifact.abi, runner);

      const priceWei = ethers.parseEther(String(priceEth));
      const tx = await contract.listGuardian(tokenId, priceWei);

      // =========================================================================
      // INSTANT ZERO-DELAY OPTIMISTIC UPDATE: FLIPS THE EXACT MOMENT WALLET APPROVES!
      // =========================================================================
      const tokenMeta = this.tokens.find(t => Number(t.id) === numTokenId) || {
        id: numTokenId,
        name: `Guardian #${String(numTokenId).padStart(4, '0')}`,
        element: "Fire",
        tier: "Rare",
        power: 80,
        image: `assets/tokens/${numTokenId}.svg`
      };

      if (this.optimisticRemovedListings) {
        delete this.optimisticRemovedListings[numTokenId];
      }

      this.activeListings = (this.activeListings || []).filter(l => Number(l.tokenId) !== numTokenId);
      this.activeListings.push({
        token: tokenMeta,
        tokenId: numTokenId,
        priceWei: priceWei,
        priceEth: String(priceEth),
        seller: this.userAddress,
        _optimistic: Date.now()
      });

      // Synchronous DOM render: zero delay (<2ms)
      this.renderMarketplaceGrids();

      const expUrl = ROBINHOOD_MAINNET_PARAMS.blockExplorerUrls[0];
      this.showToast(`🎉 Guardian #${tokenId} is now listed for ${priceEth} ETH!`, 'success', `${expUrl}/tx/${tx.hash}`);

      if (statusBox) {
        statusBox.innerHTML = `
          <div style="color:#34c759; font-weight:700; font-size:1.05rem;">🟢 LISTED FOR SALE!</div>
          <p style="font-size:0.85rem; color:var(--text-muted); margin:4px 0;">
            Guardian #${tokenId} is now listed for <strong>${priceEth} ETH</strong> on the marketplace.
          </p>
          <a href="${expUrl}/tx/${tx.hash}" target="_blank" style="color:var(--gold-light); font-size:0.82rem; font-weight:700;">View Tx on Robinhood Explorer ↗</a>
        `;
      }

      // Background confirmation & reconciliation
      tx.wait().then(() => {
        setTimeout(() => {
          this.fetchActiveListings().then(() => this.renderMarketplaceGrids()).catch(() => {});
        }, 2000);
      }).catch(err => {
        console.warn("Listing confirmation notice:", err);
      });

    } catch (err) {
      console.error("Listing failed:", err);
      if (listBtn) {
        listBtn.disabled = false;
        listBtn.innerHTML = origBtnHtml;
      }
      this.showToast(`Listing cancelled or failed: ${err.message}`, 'error');
      if (statusBox) {
        statusBox.style.display = 'block';
        statusBox.innerHTML = `<div style="color:#ff5252;">❌ Listing Failed: ${err.message}</div>`;
      }
    }
  }

  async buyMarketGuardian(tokenId, priceWei, priceEth) {
    if (!this.userAddress) {
      this.showToast("Please connect your wallet first.", 'error');
      await this.connectWallet(true);
      return;
    }

    const numTokenId = Number(tokenId);
    const balance = await this.provider.getBalance(this.userAddress);
    if (balance < priceWei) {
      this.showToast(`Insufficient balance to buy Guardian #${tokenId} for ${priceEth} ETH.`, 'error');
      return;
    }

    const statusBox = document.getElementById('market-action-status');
    const buyBtn = document.querySelector(`.btn-buy-listing[data-token-id="${numTokenId}"]`);
    const origBuyBtnHtml = buyBtn ? buyBtn.innerHTML : '⚡ Buy Now';
    if (buyBtn) {
      buyBtn.disabled = true;
      buyBtn.innerHTML = '⏳ Confirming in Wallet...';
    }

    try {
      this.showToast(`Purchasing Guardian #${tokenId} for ${priceEth} ETH... Confirm in your wallet.`, 'info');
      if (statusBox) {
        statusBox.style.display = 'block';
        statusBox.innerHTML = `<span style="color:var(--gold-light);">⏳ Confirming purchase for Guardian #${tokenId} in your wallet...</span>`;
      }

      const runner = this.signer || (await this.provider.getSigner());
      const contract = new ethers.Contract(this.contractAddress, this.contractArtifact.abi, runner);

      const tx = await contract.buyGuardian(tokenId, { value: priceWei, gasLimit: 300000n });

      // =========================================================================
      // INSTANT ZERO-DELAY OPTIMISTIC UPDATE: FLIPS THE EXACT MOMENT WALLET APPROVES!
      // =========================================================================
      const purchasedToken = this.tokens.find(t => Number(t.id) === numTokenId) || {
        id: numTokenId,
        name: `Guardian #${String(numTokenId).padStart(4, '0')}`,
        archetype: "Mythical Guardian",
        element: "Fire",
        power: 80,
        tier: "Rare",
        image: `assets/tokens/${numTokenId}.svg`
      };
      purchasedToken._optimistic = Date.now();

      // 1. Immediately place in user's wallet (unshift to show as newest)
      if (!this.walletTokens.some(t => Number(t.id) === numTokenId)) {
        this.walletTokens.unshift(purchasedToken);
      }

      // 2. Mark removed from listings
      if (this.optimisticRemovedListings) {
        this.optimisticRemovedListings[numTokenId] = Date.now();
      }
      this.activeListings = (this.activeListings || []).filter(l => Number(l.tokenId) !== numTokenId);

      // 3. Immediately update UI synchronously (0ms delay!)
      this.updateWalletUI();
      this.updateAltarStatus();
      this.renderMarketplaceGrids();

      this.showToast(`🎉 Purchase submitted! Guardian #${tokenId} is now in your wallet!`, 'success');

      if (statusBox) {
        statusBox.innerHTML = `
          <div style="color:#34c759; font-weight:700; font-size:1.15rem; margin-bottom:4px;">🎉 PURCHASE SUCCESSFUL!</div>
          <p style="font-size:0.9rem; color:var(--text-muted); margin:6px 0 10px 0;">
            You have successfully purchased <strong>${purchasedToken.name}</strong>! It is now in your wallet.
          </p>
          <div style="display:flex; justify-content:center; gap:12px; flex-wrap:wrap; align-items:center;">
            <button class="btn-gold" id="btn-goto-my-nfts" style="font-size:0.84rem; padding:8px 16px;">
              👁️ View in My Guardians (${this.walletTokens.length})
            </button>
            <a href="${ROBINHOOD_MAINNET_PARAMS.blockExplorerUrls[0]}/tx/${tx.hash}" target="_blank" style="color:var(--gold-light); font-size:0.82rem; font-weight:700;">
              View Tx on Robinhood Explorer ↗
            </a>
          </div>
        `;
        const btnGoto = document.getElementById('btn-goto-my-nfts');
        if (btnGoto) {
          btnGoto.onclick = () => {
            this.showMarketSellTab();
            document.getElementById('market-sell-panel')?.scrollIntoView({ behavior: 'smooth' });
          };
        }
      }

      // 4. Background block confirmation & reconciliation
      tx.wait().then(() => {
        setTimeout(() => {
          this.checkOnChainHoldings(true);
          this.fetchActiveListings().then(() => this.renderMarketplaceGrids()).catch(() => {});
        }, 2000);
      }).catch(err => {
        console.warn("Purchase confirmation notice:", err);
      });

    } catch (err) {
      console.error("Purchase failed:", err);
      if (buyBtn) {
        buyBtn.disabled = false;
        buyBtn.innerHTML = origBuyBtnHtml;
      }
      this.showToast(`Purchase cancelled or failed: ${err.message}`, 'error');
      if (statusBox) {
        statusBox.style.display = 'block';
        statusBox.innerHTML = `<div style="color:#ff5252;">❌ Purchase Failed: ${err.message}</div>`;
      }
    }
  }

  async cancelMarketListing(tokenId) {
    if (!this.userAddress) {
      this.showToast("Please connect your wallet first.", 'error');
      return;
    }

    const numTokenId = Number(tokenId);
    const statusBox = document.getElementById('market-action-status');

    const cancelBtn = document.querySelector(`.btn-cancel-listing[data-token-id="${numTokenId}"]`);
    const origCancelBtnHtml = cancelBtn ? cancelBtn.innerHTML : 'Cancel Listing';
    if (cancelBtn) {
      cancelBtn.disabled = true;
      cancelBtn.innerHTML = '⏳ Cancelling in Wallet...';
    }

    try {
      this.showToast(`Cancelling listing for Guardian #${tokenId}... Confirm in your wallet.`, 'info');
      if (statusBox) {
        statusBox.style.display = 'block';
        statusBox.innerHTML = `<span style="color:var(--gold-light);">⏳ Cancelling listing for Guardian #${tokenId} in your wallet...</span>`;
      }

      const runner = this.signer || (await this.provider.getSigner());
      const contract = new ethers.Contract(this.contractAddress, this.contractArtifact.abi, runner);

      const tx = await contract.cancelListing(tokenId);

      // =========================================================================
      // INSTANT ZERO-DELAY OPTIMISTIC REMOVAL: FLIPS THE EXACT MOMENT WALLET APPROVES!
      // =========================================================================
      if (this.optimisticRemovedListings) {
        this.optimisticRemovedListings[numTokenId] = Date.now();
      }
      this.activeListings = (this.activeListings || []).filter(l => Number(l.tokenId) !== numTokenId);

      // Synchronous DOM render: zero delay (<2ms)
      this.renderMarketplaceGrids();

      this.showToast(`✅ Listing for Guardian #${tokenId} has been cancelled!`, 'success');

      if (statusBox) {
        statusBox.innerHTML = `<div style="color:#34c759;">✅ Listing for Guardian #${tokenId} cancelled successfully.</div>`;
      }

      // Background confirmation & reconciliation
      tx.wait().then(() => {
        setTimeout(() => {
          this.fetchActiveListings().then(() => this.renderMarketplaceGrids()).catch(() => {});
        }, 2000);
      }).catch(err => {
        console.warn("Cancel confirmation notice:", err);
      });

    } catch (err) {
      console.error("Cancellation failed:", err);
      if (cancelBtn) {
        cancelBtn.disabled = false;
        cancelBtn.innerHTML = origCancelBtnHtml;
      }
      this.showToast(`Cancellation cancelled or failed: ${err.message}`, 'error');
      if (statusBox) {
        statusBox.style.display = 'block';
        statusBox.innerHTML = `<div style="color:#ff5252;">❌ Cancellation Failed: ${err.message}</div>`;
      }
    }
  }

  // ==========================================
  // 2,222 Collection Gallery: Filters & Pagination
  // ==========================================
  initGalleryFilters() {
    const filterBeast = document.getElementById('filter-beast');
    const filterElement = document.getElementById('filter-element');
    const filterTier = document.getElementById('filter-tier');
    const searchInput = document.getElementById('gallery-search');
    const btnPrev = document.getElementById('btn-page-prev');
    const btnNext = document.getElementById('btn-page-next');

    const apply = () => {
      const bVal = filterBeast ? filterBeast.value : 'all';
      const eVal = filterElement ? filterElement.value : 'all';
      const tVal = filterTier ? filterTier.value : 'all';
      const qVal = searchInput ? searchInput.value.trim().toLowerCase() : '';

      this.filteredTokens = this.tokens.filter(t => {
        const beastName = t.archetype || t.properties?.beast_code || '';
        const elementName = t.element || t.properties?.element_name || '';
        const tierName = t.tier || t.attributes?.find(a => a.trait_type === 'Rarity Tier')?.value || '';
        const idStr = String(t.id || t.edition || '');

        const beastMatch = bVal === 'all' || beastName.toLowerCase().includes(bVal.toLowerCase());
        const elMatch = eVal === 'all' || elementName.toLowerCase() === eVal.toLowerCase();
        const tierMatch = tVal === 'all' || tierName.toLowerCase() === tVal.toLowerCase();
        const searchMatch = !qVal || t.name.toLowerCase().includes(qVal) || idStr.includes(qVal.replace('#', ''));

        return beastMatch && elMatch && tierMatch && searchMatch;
      });

      this.currentPage = 1;
      this.renderGallery();
    };

    if (filterBeast) filterBeast.addEventListener('change', apply);
    if (filterElement) filterElement.addEventListener('change', apply);
    if (filterTier) filterTier.addEventListener('change', apply);
    if (searchInput) searchInput.addEventListener('input', apply);

    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.renderGallery();
          document.getElementById('tab-gallery')?.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    if (btnNext) {
      btnNext.addEventListener('click', () => {
        const totalPages = Math.max(1, Math.ceil(this.filteredTokens.length / this.pageSize));
        if (this.currentPage < totalPages) {
          this.currentPage++;
          this.renderGallery();
          document.getElementById('tab-gallery')?.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  }

  renderGallery() {
    const grid = document.getElementById('gallery-grid');
    const indicator = document.getElementById('gallery-page-indicator');
    const btnPrev = document.getElementById('btn-page-prev');
    const btnNext = document.getElementById('btn-page-next');
    if (!grid) return;

    grid.innerHTML = '';
    const totalPages = Math.max(1, Math.ceil(this.filteredTokens.length / this.pageSize));
    this.currentPage = Math.min(Math.max(1, this.currentPage), totalPages);

    if (indicator) {
      indicator.innerText = `Page ${this.currentPage} of ${totalPages} (${this.filteredTokens.length} Guardians)`;
    }
    if (btnPrev) btnPrev.disabled = (this.currentPage === 1);
    if (btnNext) btnNext.disabled = (this.currentPage === totalPages);

    const startIdx = (this.currentPage - 1) * this.pageSize;
    const pageItems = this.filteredTokens.slice(startIdx, startIdx + this.pageSize);

    pageItems.forEach(token => {
      const card = document.createElement('div');
      card.className = 'beast-card';

      const tier = token.tier || token.attributes?.find(a => a.trait_type === 'Rarity Tier')?.value || 'Rare';
      const element = token.element || token.properties?.element_name || 'Fire';
      const power = token.power || token.properties?.power_rating || 80;
      const archetype = token.archetype || token.properties?.beast_code || 'Guardian';
      const imageSrc = token.image || `assets/tokens/${token.id}.svg`;

      card.innerHTML = `
        <img src="${imageSrc}" alt="${token.name}" loading="lazy"/>
        <div class="beast-card-info">
          <div class="beast-card-header">
            <span class="beast-card-title">${token.name}</span>
          </div>
        </div>
      `;

      card.addEventListener('click', () => this.openInspectorModal(token));
      grid.appendChild(card);
    });
  }

  async openInspectorModal(token) {
    const modal = document.getElementById('inspector-modal');
    if (!modal) return;

    const tokenId = token.id || token.edition;
    const imageSrc = token.image || `assets/tokens/${tokenId}.svg`;

    document.getElementById('modal-token-img').src = imageSrc;
    document.getElementById('modal-token-title').innerText = token.name;

    let fullData = token;
    if (!token.attributes) {
      try {
        const res = await fetch(`../metadata/json/${tokenId}.json`);
        fullData = await res.json();
      } catch(e) {
        fullData = {
          name: token.name,
          edition: tokenId,
          description: `Mythical ${token.archetype} of the ${token.element} element from ${token.realm || 'Kunlun'}.`,
          attributes: [
            { trait_type: "Archetype", value: token.archetype },
            { trait_type: "Element", value: token.element },
            { trait_type: "Rarity Tier", value: token.tier },
            { trait_type: "Combat Power", value: token.power, max_value: 100 },
            { trait_type: "Affinity Mastery", value: token.mastery, max_value: 5 },
            { trait_type: "Sacred Realm", value: token.realm || "Kunlun Sacred Peaks" },
            { trait_type: "Sacred Relic", value: token.relic || "Imperial Jade Dragon Seal" }
          ]
        };
      }
    }

    document.getElementById('modal-token-desc').innerText = fullData.description || '';

    const traitsContainer = document.getElementById('modal-token-traits');
    traitsContainer.innerHTML = '';
    (fullData.attributes || []).forEach(attr => {
      const tag = document.createElement('div');
      tag.className = 'trait-tag';
      tag.style.padding = '4px 10px';
      tag.innerHTML = `<strong>${attr.trait_type}:</strong> ${attr.value}`;
      traitsContainer.appendChild(tag);
    });

    const jsonViewer = document.getElementById('modal-token-json');
    if (jsonViewer) {
      jsonViewer.innerText = JSON.stringify(fullData, null, 2);
    }

    modal.classList.add('active');

    const btnClose = document.getElementById('modal-close-btn');
    if (btnClose) {
      btnClose.onclick = () => modal.classList.remove('active');
    }

    const btnBattleWith = document.getElementById('modal-btn-battle');
    if (btnBattleWith) {
      btnBattleWith.onclick = () => {
        modal.classList.remove('active');
        const numId = Number(tokenId);
        const ownedToken = (this.walletTokens || []).find(t => Number(t.id) === numId);

        if (ownedToken) {
          this.switchTab('tab-game');
          if (window.loreBattle) {
            window.loreBattle.selectChampion(ownedToken, true);
          }
        } else {
          this.showToast(`You do not own Guardian #${tokenId}! In the Trial of the Five Elements, you can only fight with Guardians in your wallet.`, 'info');
          this.switchTab('tab-game');
        }
      };
    }

    const btnOpensea = document.getElementById('modal-btn-opensea');
    if (btnOpensea) {
      const activeContract = this.contractAddress || "0xb61B19e865738f8dAdd17CD4E1D516e9F00B88bB";
      let openseaBase = ROBINHOOD_MAINNET_PARAMS.openseaBase;
      if (this.currentChainId === ROBINHOOD_TESTNET_PARAMS.chainIdDec) {
        openseaBase = ROBINHOOD_TESTNET_PARAMS.openseaBase;
      }
      btnOpensea.href = `${openseaBase}/${activeContract}/${tokenId}`;
      btnOpensea.title = `Trade Guardian #${tokenId} on OpenSea`;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.guardianApp = new GuardianApp();
});
