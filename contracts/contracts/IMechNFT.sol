// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IMechNFT
 * @dev Interface for MechNFT contract
 */
interface IMechNFT {
    struct MechStats {
        uint256 attack;
        uint256 defense;
        uint256 speed;
        uint256 health;
        uint256 energy;
        uint256 level;
        uint256 experience;
        uint256 battlesWon;
        uint256 battlesLost;
        uint256 mechType;
        uint256 rarity;
        bool staked;
    }
    
    function ownerOf(uint256 tokenId) external view returns (address);
    function getMechStats(uint256 tokenId) external view returns (MechStats memory);
    function gainExperience(uint256 tokenId, uint256 exp) external;
    function updateBattleRecord(uint256 tokenId, bool won) external;
    function setStaked(uint256 tokenId, bool staked) external;
}