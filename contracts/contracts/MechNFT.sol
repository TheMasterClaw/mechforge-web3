// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title MechNFT
 * @dev ERC-721 contract for MechForge mech NFTs with battle stats
 */
contract MechNFT is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable, ReentrancyGuard, Pausable {
    
    // Mech stats structure
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
        uint256 mechType; // 1-5 for different mech classes
        uint256 rarity; // 1=Common, 2=Uncommon, 3=Rare, 4=Epic, 5=Legendary
        bool staked;
    }
    
    // Token counter
    uint256 private _tokenIdCounter;
    
    // Minting price
    uint256 public constant MINT_PRICE = 0.001 ether;
    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public constant MAX_MINT_PER_TX = 5;
    
    // Base URI for metadata
    string private _baseTokenURI;
    
    // Mapping from token ID to mech stats
    mapping(uint256 => MechStats) public mechStats;
    
    // Authorized minters (battle arena, staking contracts)
    mapping(address => bool) public authorizedMinters;
    
    // Events
    event MechMinted(address indexed owner, uint256 indexed tokenId, uint256 mechType, uint256 rarity);
    event MechLeveledUp(uint256 indexed tokenId, uint256 newLevel);
    event ExperienceGained(uint256 indexed tokenId, uint256 amount);
    event StatsUpdated(uint256 indexed tokenId);
    event MinterAuthorized(address indexed minter);
    event MinterRevoked(address indexed minter);
    
    modifier onlyAuthorized() {
        require(authorizedMinters[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }
    
    constructor(string memory baseURI) ERC721("MechForge", "MECH") Ownable(msg.sender) {
        _baseTokenURI = baseURI;
        _tokenIdCounter = 1; // Start from 1
    }
    
    /**
     * @dev Mint a new mech NFT
     * @param quantity Number of mechs to mint
     */
    function mint(uint256 quantity) external payable nonReentrant whenNotPaused {
        require(quantity > 0 && quantity <= MAX_MINT_PER_TX, "Invalid quantity");
        require(_tokenIdCounter + quantity <= MAX_SUPPLY, "Would exceed max supply");
        require(msg.value >= MINT_PRICE * quantity, "Insufficient payment");
        
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _tokenIdCounter;
            _tokenIdCounter++;
            
            // Generate random mech stats
            MechStats memory stats = _generateRandomStats(tokenId);
            mechStats[tokenId] = stats;
            
            _safeMint(msg.sender, tokenId);
            _setTokenURI(tokenId, _generateTokenURI(tokenId, stats));
            
            emit MechMinted(msg.sender, tokenId, stats.mechType, stats.rarity);
        }
    }
    
    /**
     * @dev Generate random stats for a new mech
     */
    function _generateRandomStats(uint256 tokenId) internal view returns (MechStats memory) {
        uint256 seed = uint256(keccak256(abi.encodePacked(block.timestamp, tokenId, msg.sender)));
        
        // Determine rarity (weighted)
        uint256 rarityRoll = seed % 100;
        uint256 rarity;
        if (rarityRoll < 50) rarity = 1; // Common 50%
        else if (rarityRoll < 75) rarity = 2; // Uncommon 25%
        else if (rarityRoll < 90) rarity = 3; // Rare 15%
        else if (rarityRoll < 98) rarity = 4; // Epic 8%
        else rarity = 5; // Legendary 2%
        
        // Mech type (1-5)
        uint256 mechType = ((seed >> 8) % 5) + 1;
        
        // Base stats based on rarity
        uint256 baseMultiplier = rarity * 10;
        
        uint256 attack = 50 + ((seed >> 16) % 50) + baseMultiplier;
        uint256 defense = 50 + ((seed >> 24) % 50) + baseMultiplier;
        uint256 speed = 50 + ((seed >> 32) % 50) + baseMultiplier;
        uint256 health = 100 + ((seed >> 40) % 100) + (baseMultiplier * 2);
        uint256 energy = 50 + ((seed >> 48) % 50) + baseMultiplier;
        
        return MechStats({
            attack: attack,
            defense: defense,
            speed: speed,
            health: health,
            energy: energy,
            level: 1,
            experience: 0,
            battlesWon: 0,
            battlesLost: 0,
            mechType: mechType,
            rarity: rarity,
            staked: false
        });
    }
    
    /**
     * @dev Generate metadata URI for a mech
     */
    function _generateTokenURI(uint256 tokenId, MechStats memory stats) internal pure returns (string memory) {
        return string(abi.encodePacked(
            "data:application/json;base64,",
            _encodeBase64(bytes(string(abi.encodePacked(
                '{"name":"Mech #', _uintToString(tokenId),
                '","description":"A battle-ready mech from MechForge","attributes":[',
                '{"trait_type":"Type","value":"', _getMechTypeName(stats.mechType), '"},',
                '{"trait_type":"Rarity","value":"', _getRarityName(stats.rarity), '"},',
                '{"trait_type":"Level","value":', _uintToString(stats.level), '},',
                '{"trait_type":"Attack","value":', _uintToString(stats.attack), '},',
                '{"trait_type":"Defense","value":', _uintToString(stats.defense), '},',
                '{"trait_type":"Speed","value":', _uintToString(stats.speed), '},',
                '{"trait_type":"Health","value":', _uintToString(stats.health), '}]}'
            ))))
        ));
    }
    
    function _getMechTypeName(uint256 mechType) internal pure returns (string memory) {
        string[6] memory names = ["", "Assault", "Tank", "Scout", "Sniper", "Support"];
        return names[mechType];
    }
    
    function _getRarityName(uint256 rarity) internal pure returns (string memory) {
        string[6] memory names = ["", "Common", "Uncommon", "Rare", "Epic", "Legendary"];
        return names[rarity];
    }
    
    function _uintToString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
    
    function _encodeBase64(bytes memory data) internal pure returns (string memory) {
        string memory TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        uint256 len = data.length;
        if (len == 0) return "";
        
        uint256 encodedLen = 4 * ((len + 2) / 3);
        bytes memory result = new bytes(encodedLen + 32);
        
        bytes memory table = bytes(TABLE);
        
        assembly {
            let tablePtr := add(table, 1)
            let resultPtr := add(result, 32)
            
            for {
                let i := 0
            } lt(i, len) {
                i := add(i, 3)
            } {
                let input := and(mload(add(data, i)), 0xffffff)
                
                let out := mload(add(tablePtr, and(shr(18, input), 0x3F)))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(shr(12, input), 0x3F))), 0xFF))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(shr(6, input), 0x3F))), 0xFF))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(input, 0x3F))), 0xFF))
                out := shl(224, out)
                
                mstore(resultPtr, out)
                
                resultPtr := add(resultPtr, 4)
            }
            
            switch mod(len, 3)
            case 1 { mstore(sub(resultPtr, 2), shl(240, 0x3d3d)) }
            case 2 { mstore(sub(resultPtr, 1), shl(248, 0x3d)) }
        }
        
        return string(result);
    }
    
    /**
     * @dev Update mech experience and level
     */
    function gainExperience(uint256 tokenId, uint256 exp) external onlyAuthorized {
        require(_ownerOf(tokenId) != address(0), "Mech does not exist");
        
        MechStats storage stats = mechStats[tokenId];
        stats.experience += exp;
        
        // Level up formula: level * 100 exp needed
        while (stats.experience >= stats.level * 100) {
            stats.experience -= stats.level * 100;
            stats.level++;
            
            // Boost stats on level up
            stats.attack += 5;
            stats.defense += 5;
            stats.speed += 3;
            stats.health += 10;
            stats.energy += 5;
            
            emit MechLeveledUp(tokenId, stats.level);
        }
        
        emit ExperienceGained(tokenId, exp);
    }
    
    /**
     * @dev Update battle record
     */
    function updateBattleRecord(uint256 tokenId, bool won) external onlyAuthorized {
        require(_ownerOf(tokenId) != address(0), "Mech does not exist");
        
        if (won) {
            mechStats[tokenId].battlesWon++;
        } else {
            mechStats[tokenId].battlesLost++;
        }
    }
    
    /**
     * @dev Set staked status
     */
    function setStaked(uint256 tokenId, bool staked) external onlyAuthorized {
        require(_ownerOf(tokenId) != address(0), "Mech does not exist");
        mechStats[tokenId].staked = staked;
    }
    
    /**
     * @dev Get mech stats
     */
    function getMechStats(uint256 tokenId) external view returns (MechStats memory) {
        require(_ownerOf(tokenId) != address(0), "Mech does not exist");
        return mechStats[tokenId];
    }
    
    /**
     * @dev Get mechs owned by address
     */
    function getMechsByOwner(address owner) external view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](tokenCount);
        
        for (uint256 i = 0; i < tokenCount; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(owner, i);
        }
        
        return tokenIds;
    }
    
    /**
     * @dev Authorize a minter/battle arena
     */
    function authorizeMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = true;
        emit MinterAuthorized(minter);
    }
    
    /**
     * @dev Revoke minter authorization
     */
    function revokeMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = false;
        emit MinterRevoked(minter);
    }
    
    /**
     * @dev Admin mint for giveaways/promotions
     */
    function adminMint(address to) external onlyOwner {
        require(_tokenIdCounter < MAX_SUPPLY, "Max supply reached");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        MechStats memory stats = _generateRandomStats(tokenId);
        mechStats[tokenId] = stats;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, _generateTokenURI(tokenId, stats));
        
        emit MechMinted(to, tokenId, stats.mechType, stats.rarity);
    }
    
    /**
     * @dev Set base URI
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    /**
     * @dev Withdraw contract balance
     */
    function withdraw() external onlyOwner {
        (bool success, ) = payable(owner()).call{value: address(this).balance}("");
        require(success, "Transfer failed");
    }
    
    /**
     * @dev Pause/unpause minting
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    // Override required functions
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    receive() external payable {}
}