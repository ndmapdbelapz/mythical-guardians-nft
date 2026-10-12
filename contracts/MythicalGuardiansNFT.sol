// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MythicalGuardiansNFT
 * @dev High-art generative PFP collection featuring legendary creatures across traditions
 * (Azure Dragon, Vermilion Bird, White Tiger, Black Tortoise, Nine-Tailed Fox, Qilin, Garuda, Tengu).
 * 
 * Key Features:
 * 1. Random Token ID Minting (Fisher-Yates O(1) on-chain shuffler across 1..2222)
 * 2. On-Chain OpenSea-Style Marketplace: list, cancel, and atomic buy with royalty forwarding
 * 3. ERC-721 Standard + ERC-2981 On-Chain Royalties (5% to designated treasury)
 * 4. Token Enumerable by Owner (tokensOfOwner helper for instant wallet portfolio lookup)
 * 5. Sacred Pentagonal Altar Convergence verification (checkElementalMastery)
 */

interface IERC165 {
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

interface IERC721 is IERC165 {
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    function balanceOf(address owner) external view returns (uint256 balance);
    function ownerOf(uint256 tokenId) external view returns (address owner);
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data) external;
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
    function transferFrom(address from, address to, uint256 tokenId) external;
    function approve(address to, uint256 tokenId) external;
    function setApprovalForAll(address operator, bool approved) external;
    function getApproved(uint256 tokenId) external view returns (address operator);
    function isApprovedForAll(address owner, address operator) external view returns (bool);
}

interface IERC721Metadata is IERC721 {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function tokenURI(uint256 tokenId) external view returns (string memory);
}

interface IERC2981 is IERC165 {
    function royaltyInfo(uint256 tokenId, uint256 salePrice) external view returns (address receiver, uint256 royaltyAmount);
}

abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }
}

abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor() {
        _transferOwnership(_msgSender());
    }

    function owner() public view virtual returns (address) {
        return _owner;
    }

    modifier onlyOwner() {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
        _;
    }

    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is zero address");
        _transferOwnership(newOwner);
    }

    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

contract MythicalGuardiansNFT is Context, Ownable, IERC721, IERC721Metadata, IERC2981 {
    string private _name;
    string private _symbol;
    string private _baseTokenURI;
    string private _contractURI;

    uint256 public constant MAX_SUPPLY = 2222;
    uint256 public remainingSupply = 2222;
    uint256 public mintPrice = 0.0005 ether;
    uint256 public maxMintPerTx = 5;
    uint256 public constant MAX_PER_WALLET = 5;
    mapping(address => uint256) public mintedPerWallet;
    bool public mintActive = true;

    // Fisher-Yates Random Token ID Shuffler (1 to 2222)
    mapping(uint256 => uint256) private _availableIds;

    // Designated Treasury Wallet for Mint Tribute & Royalties
    address payable public treasury = payable(0xb862866110dbF9aD25d25A85422101d0b03615c3);

    // EIP-2981 Royalty parameters (5% default)
    address public royaltyRecipient = 0xb862866110dbF9aD25d25A85422101d0b03615c3;
    uint96 public royaltyFraction = 500; // 500 / 10000 = 5%

    // Sacred Elements
    enum Element { Fire, Water, Earth, Air, Void }

    // Legendary Mythical Archetypes
    enum BeastType {
        AzureDragon,     // Qinglong (Wood/Air/Storm)
        VermilionBird,   // Zhuque (Fire/Resurrection)
        WhiteTiger,      // Baihu (Metal/Earth/War)
        BlackTortoise,   // Xuanwu (Water/Abyss)
        NineTailedFox,   // Kitsune / Huli Jing / Gumiho (Spirit/Fire)
        Qilin,           // Kirin (Void/Celestial Harmony)
        Garuda,          // Sun-Winged Sovereign
        Tengu            // Gale Blade Yōkai Lord
    }

    struct GuardianAttributes {
        BeastType beastType;
        Element element;
        uint8 powerRating;      // 60 - 100 base combat score
        uint8 affinityMastery;  // 1 - 5 stars
        uint32 lineageBlock;    // block of birth
    }

    // Token ID -> Owner
    mapping(uint256 => address) private _owners;
    // Owner -> Balance
    mapping(address => uint256) private _balances;
    // Token ID -> Approved address
    mapping(uint256 => address) private _tokenApprovals;
    // Owner -> Operator -> approved
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    // Token ID -> Attributes
    mapping(uint256 => GuardianAttributes) public guardianAttributes;

    // Owner -> Array of Token IDs
    mapping(address => uint256[]) private _ownedTokens;
    // Token ID -> Index in owner's array
    mapping(uint256 => uint256) private _ownedTokensIndex;

    // Address of Sanctum Ritual contract
    address public sanctumContract;

    // ==========================================
    // On-Chain OpenSea-Style Marketplace
    // ==========================================

    struct Listing {
        address seller;
        uint256 price;
        bool active;
    }

    // Token ID -> Listing
    mapping(uint256 => Listing) public listings;
    uint256[] private _activeListingIds;

    event GuardianListed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event ListingCanceled(uint256 indexed tokenId, address indexed seller);
    event GuardianSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);

    event GuardianSummoned(
        address indexed summoner,
        uint256 indexed tokenId,
        BeastType beastType,
        Element element,
        uint8 powerRating
    );

    constructor(
        string memory name_,
        string memory symbol_,
        string memory baseURI_,
        address royaltyReceiver_
    ) {
        _name = name_;
        _symbol = symbol_;
        _baseTokenURI = baseURI_;
        _contractURI = "https://ndmapdbelapz.github.io/mythical-guardians-nft/web/assets/contract_metadata.json";
        royaltyRecipient = royaltyReceiver_ != address(0) ? royaltyReceiver_ : 0xb862866110dbF9aD25d25A85422101d0b03615c3;
        treasury = payable(0xb862866110dbF9aD25d25A85422101d0b03615c3);
    }

    // ==========================================
    // ERC-721 Standard Implementation
    // ==========================================

    function name() public view override returns (string memory) {
        return _name;
    }

    function symbol() public view override returns (string memory) {
        return _symbol;
    }

    function totalSupply() public view returns (uint256) {
        return MAX_SUPPLY - remainingSupply;
    }

    function balanceOf(address owner) public view override returns (uint256) {
        require(owner != address(0), "ERC721: address zero is not a valid owner");
        return _balances[owner];
    }

    function ownerOf(uint256 tokenId) public view override returns (address) {
        address owner = _owners[tokenId];
        require(owner != address(0), "ERC721: invalid token ID");
        return owner;
    }

    function approve(address to, uint256 tokenId) public override {
        address owner = ownerOf(tokenId);
        require(to != owner, "ERC721: approval to current owner");
        require(
            _msgSender() == owner || isApprovedForAll(owner, _msgSender()),
            "ERC721: approve caller is not token owner or approved for all"
        );
        _approve(to, tokenId);
    }

    function getApproved(uint256 tokenId) public view override returns (address) {
        require(_exists(tokenId), "ERC721: approved query for nonexistent token");
        return _tokenApprovals[tokenId];
    }

    function setApprovalForAll(address operator, bool approved) public override {
        require(operator != _msgSender(), "ERC721: approve to caller");
        _operatorApprovals[_msgSender()][operator] = approved;
        emit ApprovalForAll(_msgSender(), operator, approved);
    }

    function isApprovedForAll(address owner, address operator) public view override returns (bool) {
        return _operatorApprovals[owner][operator];
    }

    function transferFrom(address from, address to, uint256 tokenId) public override {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: caller is not token owner or approved");
        _transfer(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) public override {
        safeTransferFrom(from, to, tokenId, "");
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public override {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: caller is not token owner or approved");
        _safeTransfer(from, to, tokenId, data);
    }

    function tokensOfOwner(address owner) external view returns (uint256[] memory) {
        return _ownedTokens[owner];
    }

    // ==========================================
    // Random Summoning (Minting) Logic
    // ==========================================

    /**
     * @notice Summon guardians into existence with random, non-sequential Token IDs.
     * Uses Fisher-Yates on-chain shuffle for 100% collision-free random IDs between 1 and 2,222.
     */
    function summonGuardians(uint256 quantity) external payable {
        require(mintActive, "Summoning portal is dormant");
        require(quantity > 0 && quantity <= maxMintPerTx, "Invalid summon quantity");
        require(mintedPerWallet[msg.sender] + quantity <= MAX_PER_WALLET, "Exceeds max 5 per wallet limit");
        require(remainingSupply >= quantity, "Exceeds remaining guardian supply");
        require(msg.value >= mintPrice * quantity, "Insufficient tribute");

        mintedPerWallet[msg.sender] += quantity;

        for (uint256 i = 0; i < quantity; i++) {
            uint256 entropy = uint256(
                keccak256(
                    abi.encodePacked(
                        block.prevrandao,
                        block.timestamp,
                        msg.sender,
                        remainingSupply,
                        i
                    )
                )
            );

            uint256 tokenId = _getRandomTokenId(entropy);

            GuardianAttributes memory attrs = _generateAttributes(tokenId, msg.sender, i);
            guardianAttributes[tokenId] = attrs;

            _safeMint(msg.sender, tokenId);

            emit GuardianSummoned(msg.sender, tokenId, attrs.beastType, attrs.element, attrs.powerRating);
        }

        // Direct forward of ETH tribute to designated treasury wallet
        if (msg.value > 0) {
            (bool success, ) = treasury.call{value: msg.value}("");
            require(success, "Treasury transfer failed");
        }
    }

    /**
     * @notice Admin reserve summon for community vaults and rewards
     */
    function reserveSummon(address recipient, uint256 quantity) external onlyOwner {
        require(remainingSupply >= quantity, "Exceeds remaining supply");
        for (uint256 i = 0; i < quantity; i++) {
            uint256 entropy = uint256(
                keccak256(
                    abi.encodePacked(
                        block.prevrandao,
                        block.timestamp,
                        recipient,
                        remainingSupply,
                        i
                    )
                )
            );

            uint256 tokenId = _getRandomTokenId(entropy);

            GuardianAttributes memory attrs = _generateAttributes(tokenId, recipient, i);
            guardianAttributes[tokenId] = attrs;

            _safeMint(recipient, tokenId);
            emit GuardianSummoned(recipient, tokenId, attrs.beastType, attrs.element, attrs.powerRating);
        }
    }

    function _getRandomTokenId(uint256 entropy) internal returns (uint256) {
        require(remainingSupply > 0, "No guardians remaining");
        uint256 randomIndex = entropy % remainingSupply;

        uint256 selectedId = _availableIds[randomIndex] != 0 ? _availableIds[randomIndex] : randomIndex + 1;
        uint256 lastIndex = remainingSupply - 1;
        uint256 lastVal = _availableIds[lastIndex] != 0 ? _availableIds[lastIndex] : lastIndex + 1;

        _availableIds[randomIndex] = lastVal;
        remainingSupply--;

        return selectedId;
    }

    // ==========================================
    // On-Chain Peer-to-Peer Marketplace
    // ==========================================

    /**
     * @notice List an owned guardian for sale at an asking price in ETH.
     */
    function listGuardian(uint256 tokenId, uint256 price) external {
        require(ownerOf(tokenId) == msg.sender, "Caller is not guardian owner");
        require(price > 0, "Price must be greater than zero");

        listings[tokenId] = Listing({
            seller: msg.sender,
            price: price,
            active: true
        });

        _addActiveListingId(tokenId);
        emit GuardianListed(tokenId, msg.sender, price);
    }

    /**
     * @notice Cancel an existing guardian listing.
     */
    function cancelListing(uint256 tokenId) external {
        Listing memory l = listings[tokenId];
        require(l.active, "Listing is not active");
        require(l.seller == msg.sender || msg.sender == owner(), "Not seller or admin");

        delete listings[tokenId];
        _removeActiveListingId(tokenId);
        emit ListingCanceled(tokenId, msg.sender);
    }

    /**
     * @notice Buy a listed guardian. Atomic peer-to-peer swap:
     * Buyer pays asking price -> 5% royalty to treasury, 95% proceeds to seller, NFT transfers to buyer.
     */
    function buyGuardian(uint256 tokenId) external payable {
        Listing memory l = listings[tokenId];
        require(l.active, "Guardian not for sale");
        require(msg.value >= l.price, "Insufficient payment for asking price");
        require(ownerOf(tokenId) == l.seller, "Seller no longer owns guardian");
        require(msg.sender != l.seller, "Cannot buy your own guardian");

        address seller = l.seller;
        uint256 salePrice = l.price;

        // Clean up listing before fund transfers (reentrancy protection)
        delete listings[tokenId];
        _removeActiveListingId(tokenId);

        // 1. Calculate and transfer creator royalty to designated treasury
        uint256 royalty = (salePrice * royaltyFraction) / 10000;
        uint256 sellerProceeds = salePrice - royalty;

        // 2. Transfer proceeds to seller
        (bool sSuccess, ) = payable(seller).call{value: sellerProceeds}("");
        require(sSuccess, "Seller payment failed");

        // 3. Transfer royalty to treasury
        if (royalty > 0) {
            (bool tSuccess, ) = treasury.call{value: royalty}("");
            require(tSuccess, "Royalty transfer failed");
        }

        // 4. Refund excess payment if buyer sent extra
        if (msg.value > salePrice) {
            uint256 refund = msg.value - salePrice;
            (bool rSuccess, ) = payable(msg.sender).call{value: refund}("");
            require(rSuccess, "Refund failed");
        }

        // 5. Transfer NFT to buyer
        _transfer(seller, msg.sender, tokenId);

        emit GuardianSold(tokenId, seller, msg.sender, salePrice);
    }

    /**
     * @notice Returns all active listing token IDs, prices, and sellers for instant UI display.
     */
    function getActiveListings() external view returns (uint256[] memory tokenIds, uint256[] memory prices, address[] memory sellers) {
        uint256 count = _activeListingIds.length;
        tokenIds = new uint256[](count);
        prices = new uint256[](count);
        sellers = new address[](count);

        for (uint256 i = 0; i < count; i++) {
            uint256 tid = _activeListingIds[i];
            tokenIds[i] = tid;
            prices[i] = listings[tid].price;
            sellers[i] = listings[tid].seller;
        }
    }

    function _addActiveListingId(uint256 tokenId) internal {
        for (uint256 i = 0; i < _activeListingIds.length; i++) {
            if (_activeListingIds[i] == tokenId) return;
        }
        _activeListingIds.push(tokenId);
    }

    function _removeActiveListingId(uint256 tokenId) internal {
        uint256 len = _activeListingIds.length;
        for (uint256 i = 0; i < len; i++) {
            if (_activeListingIds[i] == tokenId) {
                _activeListingIds[i] = _activeListingIds[len - 1];
                _activeListingIds.pop();
                break;
            }
        }
    }

    // ==========================================
    // Elemental Utility & Convergence Verification
    // ==========================================

    function checkElementalMastery(address account) external view returns (
        bool hasAllFive,
        bool hasFire,
        bool hasWater,
        bool hasEarth,
        bool hasAir,
        bool hasVoid
    ) {
        uint256[] memory tokens = _ownedTokens[account];
        for (uint256 i = 0; i < tokens.length; i++) {
            Element el = guardianAttributes[tokens[i]].element;
            if (el == Element.Fire) hasFire = true;
            else if (el == Element.Water) hasWater = true;
            else if (el == Element.Earth) hasEarth = true;
            else if (el == Element.Air) hasAir = true;
            else if (el == Element.Void) hasVoid = true;

            if (hasFire && hasWater && hasEarth && hasAir && hasVoid) {
                return (true, true, true, true, true, true);
            }
        }

        hasAllFive = (hasFire && hasWater && hasEarth && hasAir && hasVoid);
    }

    function verifyElementalPentad(uint256[5] calldata tokenIds, address holder) external view returns (bool) {
        bool[5] memory seenElements;

        for (uint256 i = 0; i < 5; i++) {
            uint256 tid = tokenIds[i];
            require(_owners[tid] == holder, "Token not owned by holder");
            uint256 elIndex = uint256(guardianAttributes[tid].element);
            require(!seenElements[elIndex], "Duplicate element in pentad");
            seenElements[elIndex] = true;
        }

        return (seenElements[0] && seenElements[1] && seenElements[2] && seenElements[3] && seenElements[4]);
    }

    // ==========================================
    // Internal Helper Functions
    // ==========================================

    function _generateAttributes(uint256 tokenId, address minter, uint256 seedSalt)
        internal
        view
        returns (GuardianAttributes memory)
    {
        uint256 entropy = uint256(
            keccak256(
                abi.encodePacked(
                    block.prevrandao,
                    block.timestamp,
                    tokenId,
                    minter,
                    seedSalt
                )
            )
        );

        // Beast Type: 8 Archetypes
        uint256 beastRoll = (entropy % 100);
        BeastType bType;
        if (beastRoll < 16) bType = BeastType.AzureDragon;
        else if (beastRoll < 32) bType = BeastType.VermilionBird;
        else if (beastRoll < 48) bType = BeastType.WhiteTiger;
        else if (beastRoll < 64) bType = BeastType.BlackTortoise;
        else if (beastRoll < 78) bType = BeastType.NineTailedFox;
        else if (beastRoll < 88) bType = BeastType.Qilin;
        else if (beastRoll < 95) bType = BeastType.Garuda;
        else bType = BeastType.Tengu;

        // Element distribution: Fire, Water, Earth, Air, Void
        uint256 elRoll = ((entropy / 100) % 100);
        Element el;
        if (elRoll < 22) el = Element.Fire;
        else if (elRoll < 44) el = Element.Water;
        else if (elRoll < 66) el = Element.Earth;
        else if (elRoll < 88) el = Element.Air;
        else el = Element.Void;

        uint8 pRating = uint8(65 + ((entropy / 10000) % 35));
        uint8 mastery = uint8(1 + ((entropy / 1000000) % 5));

        return GuardianAttributes({
            beastType: bType,
            element: el,
            powerRating: pRating,
            affinityMastery: mastery,
            lineageBlock: uint32(block.number)
        });
    }

    function _exists(uint256 tokenId) internal view returns (bool) {
        return _owners[tokenId] != address(0);
    }

    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view returns (bool) {
        address owner = ownerOf(tokenId);
        return (spender == owner || isApprovedForAll(owner, spender) || getApproved(tokenId) == spender);
    }

    function _safeMint(address to, uint256 tokenId) internal {
        _owners[tokenId] = to;
        _balances[to] += 1;
        _addTokenToOwnerEnumeration(to, tokenId);
        emit Transfer(address(0), to, tokenId);
    }

    function _transfer(address from, address to, uint256 tokenId) internal {
        require(ownerOf(tokenId) == from, "ERC721: transfer from incorrect owner");
        require(to != address(0), "ERC721: transfer to zero address");

        // Automatically cancel any active listing if token is transferred
        if (listings[tokenId].active) {
            delete listings[tokenId];
            _removeActiveListingId(tokenId);
        }

        delete _tokenApprovals[tokenId];
        _balances[from] -= 1;
        _balances[to] += 1;
        _owners[tokenId] = to;

        _removeTokenFromOwnerEnumeration(from, tokenId);
        _addTokenToOwnerEnumeration(to, tokenId);

        emit Transfer(from, to, tokenId);
    }

    function _safeTransfer(address from, address to, uint256 tokenId, bytes memory) internal {
        _transfer(from, to, tokenId);
    }

    function _approve(address to, uint256 tokenId) internal {
        _tokenApprovals[tokenId] = to;
        emit Approval(ownerOf(tokenId), to, tokenId);
    }

    function _addTokenToOwnerEnumeration(address to, uint256 tokenId) internal {
        _ownedTokensIndex[tokenId] = _ownedTokens[to].length;
        _ownedTokens[to].push(tokenId);
    }

    function _removeTokenFromOwnerEnumeration(address from, uint256 tokenId) internal {
        uint256 lastTokenIndex = _ownedTokens[from].length - 1;
        uint256 tokenIndex = _ownedTokensIndex[tokenId];

        if (tokenIndex != lastTokenIndex) {
            uint256 lastTokenId = _ownedTokens[from][lastTokenIndex];
            _ownedTokens[from][tokenIndex] = lastTokenId;
            _ownedTokensIndex[lastTokenId] = tokenIndex;
        }

        _ownedTokens[from].pop();
        delete _ownedTokensIndex[tokenId];
    }

    // ==========================================
    // Metadata & Config Handling
    // ==========================================

    function setBaseURI(string memory newURI) external onlyOwner {
        _baseTokenURI = newURI;
    }

    function setContractURI(string memory newURI) external onlyOwner {
        _contractURI = newURI;
    }

    function contractURI() external view returns (string memory) {
        return _contractURI;
    }

    function setMintPrice(uint256 newPrice) external onlyOwner {
        mintPrice = newPrice;
    }

    function setMintActive(bool active) external onlyOwner {
        mintActive = active;
    }

    function setSanctumContract(address sanctum) external onlyOwner {
        sanctumContract = sanctum;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "ERC721: URI query for nonexistent token");
        return string(abi.encodePacked(_baseTokenURI, _uint2str(tokenId), ".json"));
    }

    // ==========================================
    // ERC-2981 Royalty Support
    // ==========================================

    function setRoyaltyInfo(address receiver, uint96 feeBasisPoints) external onlyOwner {
        require(feeBasisPoints <= 1000, "Royalty cannot exceed 10%");
        royaltyRecipient = receiver;
        royaltyFraction = feeBasisPoints;
    }

    function royaltyInfo(uint256, uint256 salePrice) external view override returns (address, uint256) {
        uint256 royaltyAmount = (salePrice * royaltyFraction) / 10000;
        return (royaltyRecipient, royaltyAmount);
    }

    function supportsInterface(bytes4 interfaceId) public pure override returns (bool) {
        return
            interfaceId == type(IERC721).interfaceId ||
            interfaceId == type(IERC721Metadata).interfaceId ||
            interfaceId == type(IERC2981).interfaceId ||
            interfaceId == type(IERC165).interfaceId;
    }

    function setTreasury(address payable newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Invalid treasury");
        treasury = newTreasury;
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        (bool success, ) = treasury.call{value: balance}("");
        require(success, "Transfer failed");
    }

    function _uint2str(uint256 _i) internal pure returns (string memory str) {
        if (_i == 0) return "0";
        uint256 j = _i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        j = _i;
        while (j != 0) {
            bstr[--k] = bytes1(uint8(48 + (j % 10)));
            j /= 10;
        }
        str = string(bstr);
    }
}
