// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./MythicalGuardiansNFT.sol";
import "./GuardianCompanions.sol";

/**
 * @title GuardianSanctum
 * @dev The sacred altar where masters of the Five Elements converge.
 * Allows holders who possess Fire, Water, Earth, Air, and Void guardians
 * to conduct the "Celestial Convergence" ritual, unlocking Companion Art NFTs
 * and access to the "Trial of the Five Elements" lore-based web game.
 */
contract GuardianSanctum is Ownable {
    MythicalGuardiansNFT public guardiansContract;
    GuardianCompanions public companionsContract;

    // Track which set of token combinations have already completed the ritual (to avoid spamming with same set)
    mapping(bytes32 => bool) public ritualCompletedSets;
    // Track address total rituals performed
    mapping(address => uint256) public accountRituals;
    // Track address game privilege level
    mapping(address => uint256) public playerGameRank;

    event ConvergenceRitualPerformed(
        address indexed master,
        uint256[5] tokenIds,
        uint256 companionUnlockedId,
        uint256 timestamp
    );

    event LoreTrialVictoryRecorded(
        address indexed player,
        uint256 beastTokenId,
        uint256 trialStage,
        uint256 essenceReward
    );

    constructor(address _guardians, address _companions) {
        guardiansContract = MythicalGuardiansNFT(_guardians);
        companionsContract = GuardianCompanions(_companions);
    }

    function setContracts(address _guardians, address _companions) external onlyOwner {
        guardiansContract = MythicalGuardiansNFT(_guardians);
        companionsContract = GuardianCompanions(_companions);
    }

    /**
     * @notice Performs the Celestial Convergence Ritual.
     * Requires 5 tokens owned by msg.sender representing all 5 elements:
     * Fire, Water, Earth, Air, Void.
     */
    function performElementalRitual(uint256[5] calldata tokenIds) external {
        // 1. Verify that the caller owns all 5 tokens and they form a complete 5-element pentad
        bool isValidPentad = guardiansContract.verifyElementalPentad(tokenIds, msg.sender);
        require(isValidPentad, "Tokens do not fulfill the Five Elements requirement");

        // 2. Generate unique hash for this pentad combination
        bytes32 pentadHash = keccak256(abi.encodePacked(
            _sort(tokenIds)
        ));
        require(!ritualCompletedSets[pentadHash], "This guardian pentad has already awakened a companion");

        ritualCompletedSets[pentadHash] = true;
        accountRituals[msg.sender] += 1;
        playerGameRank[msg.sender] += 1;

        // 3. Determine Companion Art reward based on the lead guardian's element or ritual count
        uint256 companionRewardId;
        if (accountRituals[msg.sender] == 1) {
            // First convergence unlocks the Celestial Void Qilin Hatchling
            companionRewardId = GuardianCompanions.COMPANION_VOID_QILIN_HATCHLING;
        } else if (accountRituals[msg.sender] == 2) {
            companionRewardId = GuardianCompanions.COMPANION_FIRE_KITSUNE_ORB;
        } else if (accountRituals[msg.sender] == 3) {
            companionRewardId = GuardianCompanions.COMPANION_AIR_DRAGONET;
        } else if (accountRituals[msg.sender] == 4) {
            companionRewardId = GuardianCompanions.COMPANION_WATER_ABYSS_WYRM;
        } else if (accountRituals[msg.sender] == 5) {
            companionRewardId = GuardianCompanions.COMPANION_EARTH_STONE_CUB;
        } else {
            // Master convergence unlocks the Prismatic Archon
            companionRewardId = GuardianCompanions.COMPANION_PRISMATIC_ARCHON;
        }

        // 4. Mint the companion familiar to the summoner
        companionsContract.awakenCompanion(msg.sender, companionRewardId, 1);

        emit ConvergenceRitualPerformed(msg.sender, tokenIds, companionRewardId, block.timestamp);
    }

    /**
     * @notice Checks if an account is eligible to play elite tiers of the lore game
     */
    function isLoreGameMaster(address account) external view returns (bool) {
        (bool hasAllFive, , , , , ) = guardiansContract.checkElementalMastery(account);
        return hasAllFive || (accountRituals[account] > 0);
    }

    /**
     * @notice Sorts 5 token IDs for deterministic hashing
     */
    function _sort(uint256[5] memory arr) internal pure returns (uint256[5] memory) {
        for (uint256 i = 0; i < 5; i++) {
            for (uint256 j = i + 1; j < 5; j++) {
                if (arr[i] > arr[j]) {
                    uint256 temp = arr[i];
                    arr[i] = arr[j];
                    arr[j] = temp;
                }
            }
        }
        return arr;
    }
}
