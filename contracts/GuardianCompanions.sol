// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title GuardianCompanions
 * @dev ERC-1155 Multi-Token contract for Mythical Companion Art & Lore Familiars.
 * Unlocked exclusively by completing the Elemental Convergence Ritual (holding all 5 elements).
 */

interface IERC1155 {
    event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value);
    event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values);
    event ApprovalForAll(address indexed account, address indexed operator, bool approved);
    event URI(string value, uint256 indexed id);

    function balanceOf(address account, uint256 id) external view returns (uint256);
    function balanceOfBatch(address[] calldata accounts, uint256[] calldata ids) external view returns (uint256[] memory);
    function setApprovalForAll(address operator, bool approved) external;
    function isApprovedForAll(address account, address operator) external view returns (bool);
    function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes calldata data) external;
    function safeBatchTransferFrom(address from, address to, uint256[] calldata ids, uint256[] calldata amounts, bytes calldata data) external;
}

contract GuardianCompanions is IERC1155 {
    string public name = "Mythical Guardian Companions";
    string public symbol = "MGC-ART";

    address public owner;
    address public sanctumContract;

    // Companion IDs
    uint256 public constant COMPANION_VOID_QILIN_HATCHLING = 1;
    uint256 public constant COMPANION_FIRE_KITSUNE_ORB     = 2;
    uint256 public constant COMPANION_AIR_DRAGONET          = 3;
    uint256 public constant COMPANION_WATER_ABYSS_WYRM     = 4;
    uint256 public constant COMPANION_EARTH_STONE_CUB      = 5;
    uint256 public constant COMPANION_PRISMATIC_ARCHON     = 6;

    // Account => TokenId => Balance
    mapping(address => mapping(uint256 => uint256)) private _balances;
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    // TokenId => Total Supply
    mapping(uint256 => uint256) public totalSupply;

    // Metadata base URI
    string private _baseURI;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call");
        _;
    }

    modifier onlySanctum() {
        require(msg.sender == sanctumContract || msg.sender == owner, "Only Sanctum can awaken companions");
        _;
    }

    constructor(string memory baseURI_) {
        owner = msg.sender;
        _baseURI = baseURI_;
    }

    function setSanctumContract(address sanctum) external onlyOwner {
        sanctumContract = sanctum;
    }

    function setBaseURI(string memory newURI) external onlyOwner {
        _baseURI = newURI;
    }

    function uri(uint256 id) external view returns (string memory) {
        return string(abi.encodePacked(_baseURI, _uint2str(id), ".json"));
    }

    /**
     * @notice Awakens and mints a companion familiar to an elemental master.
     */
    function awakenCompanion(address to, uint256 companionId, uint256 amount) external onlySanctum {
        require(to != address(0), "Cannot mint to zero address");
        require(companionId >= 1 && companionId <= 6, "Invalid companion ID");

        _balances[to][companionId] += amount;
        totalSupply[companionId] += amount;

        emit TransferSingle(msg.sender, address(0), to, companionId, amount);
        emit URI(string(abi.encodePacked(_baseURI, _uint2str(companionId), ".json")), companionId);
    }

    function balanceOf(address account, uint256 id) public view override returns (uint256) {
        require(account != address(0), "ERC1155: address zero query");
        return _balances[account][id];
    }

    function balanceOfBatch(address[] calldata accounts, uint256[] calldata ids) external view override returns (uint256[] memory) {
        require(accounts.length == ids.length, "Length mismatch");
        uint256[] memory batchBalances = new uint256[](accounts.length);
        for (uint256 i = 0; i < accounts.length; ++i) {
            batchBalances[i] = balanceOf(accounts[i], ids[i]);
        }
        return batchBalances;
    }

    function setApprovalForAll(address operator, bool approved) external override {
        require(msg.sender != operator, "ERC1155: setting approval status for self");
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function isApprovedForAll(address account, address operator) public view override returns (bool) {
        return _operatorApprovals[account][operator];
    }

    function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes calldata) external override {
        require(from == msg.sender || isApprovedForAll(from, msg.sender), "Not owner nor approved");
        require(to != address(0), "Transfer to zero address");

        uint256 fromBalance = _balances[from][id];
        require(fromBalance >= amount, "Insufficient balance");
        _balances[from][id] = fromBalance - amount;
        _balances[to][id] += amount;

        emit TransferSingle(msg.sender, from, to, id, amount);
    }

    function safeBatchTransferFrom(address from, address to, uint256[] calldata ids, uint256[] calldata amounts, bytes calldata) external override {
        require(from == msg.sender || isApprovedForAll(from, msg.sender), "Not owner nor approved");
        require(ids.length == amounts.length, "Length mismatch");
        require(to != address(0), "Transfer to zero address");

        for (uint256 i = 0; i < ids.length; ++i) {
            uint256 id = ids[i];
            uint256 amount = amounts[i];
            uint256 fromBalance = _balances[from][id];
            require(fromBalance >= amount, "Insufficient balance");
            _balances[from][id] = fromBalance - amount;
            _balances[to][id] += amount;
        }

        emit TransferBatch(msg.sender, from, to, ids, amounts);
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
