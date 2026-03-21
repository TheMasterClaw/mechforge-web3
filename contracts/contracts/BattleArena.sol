// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./IMechNFT.sol";

/**
 * @title BattleArena
 * @dev PvP battle contract for MechForge
 */
contract BattleArena is Ownable, ReentrancyGuard, Pausable {
    
    IMechNFT public mechNFT;
    
    // Battle struct
    struct Battle {
        uint256 battleId;
        address challenger;
        uint256 challengerMechId;
        address defender;
        uint256 defenderMechId;
        uint256 stakeAmount;
        uint256 startTime;
        BattleStatus status;
        address winner;
        uint256[] roundResults; // 1 = challenger wins, 2 = defender wins
    }
    
    enum BattleStatus {
        Pending,
        Active,
        Completed,
        Cancelled
    }
    
    // Battle counter
    uint256 private _battleIdCounter;
    
    // Battle storage
    mapping(uint256 => Battle) public battles;
    mapping(uint256 => uint256) public mechToBattle; // mechId => battleId
    
    // Player stats
    mapping(address => uint256) public playerWins;
    mapping(address => uint256) public playerLosses;
    mapping(address => uint256) public playerTotalEarnings;
    
    // Battle settings
    uint256 public minStake = 0.0001 ether;
    uint256 public maxStake = 1 ether;
    uint256 public platformFeePercent = 5; // 5%
    uint256 public constant MAX_ROUNDS = 5;
    
    // Events
    event BattleCreated(
        uint256 indexed battleId,
        address indexed challenger,
        uint256 challengerMechId,
        uint256 stakeAmount
    );
    event BattleJoined(
        uint256 indexed battleId,
        address indexed defender,
        uint256 defenderMechId
    );
    event BattleCompleted(
        uint256 indexed battleId,
        address indexed winner,
        address indexed loser,
        uint256 prizeAmount
    );
    event BattleCancelled(uint256 indexed battleId);
    
    modifier onlyMechOwner(uint256 mechId) {
        require(mechNFT.ownerOf(mechId) == msg.sender, "Not mech owner");
        _;
    }
    
    modifier mechNotInBattle(uint256 mechId) {
        require(mechToBattle[mechId] == 0, "Mech already in battle");
        _;
    }
    
    modifier validBattle(uint256 battleId) {
        require(battleId > 0 && battleId <= _battleIdCounter, "Invalid battle ID");
        _;
    }
    
    constructor(address _mechNFT) Ownable(msg.sender) {
        mechNFT = IMechNFT(_mechNFT);
        _battleIdCounter = 1;
    }
    
    /**
     * @dev Create a new battle challenge
     * @param mechId The mech ID to use
     */
    function createBattle(uint256 mechId) 
        external 
        payable 
        nonReentrant 
        whenNotPaused
        onlyMechOwner(mechId)
        mechNotInBattle(mechId)
    {
        require(msg.value >= minStake && msg.value <= maxStake, "Invalid stake amount");
        
        IMechNFT.MechStats memory stats = mechNFT.getMechStats(mechId);
        require(!stats.staked, "Mech is staked");
        
        uint256 battleId = _battleIdCounter++;
        
        battles[battleId] = Battle({
            battleId: battleId,
            challenger: msg.sender,
            challengerMechId: mechId,
            defender: address(0),
            defenderMechId: 0,
            stakeAmount: msg.value,
            startTime: block.timestamp,
            status: BattleStatus.Pending,
            winner: address(0),
            roundResults: new uint256[](0)
        });
        
        mechToBattle[mechId] = battleId;
        
        emit BattleCreated(battleId, msg.sender, mechId, msg.value);
    }
    
    /**
     * @dev Join an existing battle challenge
     * @param battleId The battle to join
     * @param mechId The mech ID to use
     */
    function joinBattle(uint256 battleId, uint256 mechId)
        external
        payable
        nonReentrant
        whenNotPaused
        validBattle(battleId)
        onlyMechOwner(mechId)
        mechNotInBattle(mechId)
    {
        Battle storage battle = battles[battleId];
        
        require(battle.status == BattleStatus.Pending, "Battle not pending");
        require(battle.challenger != msg.sender, "Cannot battle yourself");
        require(msg.value == battle.stakeAmount, "Must match stake");
        
        IMechNFT.MechStats memory stats = mechNFT.getMechStats(mechId);
        require(!stats.staked, "Mech is staked");
        
        battle.defender = msg.sender;
        battle.defenderMechId = mechId;
        battle.status = BattleStatus.Active;
        battle.startTime = block.timestamp;
        
        mechToBattle[mechId] = battleId;
        
        emit BattleJoined(battleId, msg.sender, mechId);
        
        // Resolve battle immediately
        _resolveBattle(battleId);
    }
    
    /**
     * @dev Resolve a battle using on-chain randomness
     */
    function _resolveBattle(uint256 battleId) internal {
        Battle storage battle = battles[battleId];
        
        IMechNFT.MechStats memory challengerStats = mechNFT.getMechStats(battle.challengerMechId);
        IMechNFT.MechStats memory defenderStats = mechNFT.getMechStats(battle.defenderMechId);
        
        // Calculate battle power scores
        uint256 challengerPower = _calculateBattlePower(challengerStats, battleId, 0);
        uint256 defenderPower = _calculateBattlePower(defenderStats, battleId, 1);
        
        // Multi-round battle simulation
        uint256 challengerWins = 0;
        uint256 defenderWins = 0;
        
        for (uint256 round = 0; round < MAX_ROUNDS; round++) {
            // Add some randomness per round
            uint256 roundRandom = uint256(keccak256(abi.encodePacked(
                block.timestamp,
                battleId,
                round,
                block.prevrandao
            )));
            
            uint256 cPower = challengerPower + (roundRandom % 50);
            uint256 dPower = defenderPower + ((roundRandom >> 64) % 50);
            
            if (cPower >= dPower) {
                challengerWins++;
                battle.roundResults.push(1);
            } else {
                defenderWins++;
                battle.roundResults.push(2);
            }
            
            // Early win condition
            if (challengerWins >= 3 || defenderWins >= 3) {
                break;
            }
        }
        
        // Determine winner
        address winner;
        address loser;
        uint256 winnerMechId;
        uint256 loserMechId;
        
        if (challengerWins >= defenderWins) {
            winner = battle.challenger;
            loser = battle.defender;
            winnerMechId = battle.challengerMechId;
            loserMechId = battle.defenderMechId;
        } else {
            winner = battle.defender;
            loser = battle.challenger;
            winnerMechId = battle.defenderMechId;
            loserMechId = battle.challengerMechId;
        }
        
        battle.winner = winner;
        battle.status = BattleStatus.Completed;
        
        // Calculate prize
        uint256 totalStake = battle.stakeAmount * 2;
        uint256 platformFee = (totalStake * platformFeePercent) / 100;
        uint256 prizeAmount = totalStake - platformFee;
        
        // Update stats
        playerWins[winner]++;
        playerLosses[loser]++;
        playerTotalEarnings[winner] += prizeAmount;
        
        // Update mech records
        mechNFT.updateBattleRecord(winnerMechId, true);
        mechNFT.updateBattleRecord(loserMechId, false);
        
        // Award experience
        mechNFT.gainExperience(winnerMechId, 50);
        mechNFT.gainExperience(loserMechId, 20);
        
        // Clear battle mappings
        mechToBattle[battle.challengerMechId] = 0;
        mechToBattle[battle.defenderMechId] = 0;
        
        // Transfer prize
        (bool success, ) = payable(winner).call{value: prizeAmount}("");
        require(success, "Prize transfer failed");
        
        emit BattleCompleted(battleId, winner, loser, prizeAmount);
    }
    
    /**
     * @dev Calculate battle power from mech stats
     */
    function _calculateBattlePower(
        IMechNFT.MechStats memory stats,
        uint256 battleId,
        uint256 side
    ) internal view returns (uint256) {
        // Base power calculation
        uint256 basePower = stats.attack + stats.defense + (stats.speed / 2) + (stats.level * 10);
        
        // Add some battle-specific randomness
        uint256 battleRandom = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            battleId,
            side
        )));
        
        // Luck factor (up to 10% variance)
        uint256 luck = (basePower * (battleRandom % 10)) / 100;
        
        return basePower + luck;
    }
    
    /**
     * @dev Cancel a pending battle and refund stake
     */
    function cancelBattle(uint256 battleId) 
        external 
        nonReentrant
        validBattle(battleId)
    {
        Battle storage battle = battles[battleId];
        
        require(battle.challenger == msg.sender, "Not challenger");
        require(battle.status == BattleStatus.Pending, "Battle not pending");
        
        battle.status = BattleStatus.Cancelled;
        mechToBattle[battle.challengerMechId] = 0;
        
        // Refund stake
        (bool success, ) = payable(msg.sender).call{value: battle.stakeAmount}("");
        require(success, "Refund failed");
        
        emit BattleCancelled(battleId);
    }
    
    /**
     * @dev Get battle details
     */
    function getBattle(uint256 battleId) external view returns (Battle memory) {
        return battles[battleId];
    }
    
    /**
     * @dev Get player statistics
     */
    function getPlayerStats(address player) external view returns (
        uint256 wins,
        uint256 losses,
        uint256 earnings,
        uint256 winRate
    ) {
        wins = playerWins[player];
        losses = playerLosses[player];
        earnings = playerTotalEarnings[player];
        
        uint256 total = wins + losses;
        winRate = total > 0 ? (wins * 100) / total : 0;
    }
    
    /**
     * @dev Get active battles count
     */
    function getActiveBattlesCount() external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 1; i < _battleIdCounter; i++) {
            if (battles[i].status == BattleStatus.Pending || battles[i].status == BattleStatus.Active) {
                count++;
            }
        }
        return count;
    }
    
    /**
     * @dev Get recent battles
     */
    function getRecentBattles(uint256 count) external view returns (Battle[] memory) {
        uint256 total = _battleIdCounter - 1;
        uint256 resultCount = count > total ? total : count;
        
        Battle[] memory recent = new Battle[](resultCount);
        for (uint256 i = 0; i < resultCount; i++) {
            recent[i] = battles[total - i];
        }
        
        return recent;
    }
    
    /**
     * @dev Get pending battles
     */
    function getPendingBattles(uint256 start, uint256 count) external view returns (Battle[] memory) {
        // First count pending
        uint256 pendingCount = 0;
        for (uint256 i = 1; i < _battleIdCounter; i++) {
            if (battles[i].status == BattleStatus.Pending) {
                pendingCount++;
            }
        }
        
        // Collect pending battles
        uint256 maxResults = count > pendingCount ? pendingCount : count;
        Battle[] memory pending = new Battle[](maxResults);
        uint256 added = 0;
        uint256 index = start > 0 ? start : 1;
        
        for (uint256 i = index; i < _battleIdCounter && added < maxResults; i++) {
            if (battles[i].status == BattleStatus.Pending) {
                pending[added] = battles[i];
                added++;
            }
        }
        
        return pending;
    }
    
    /**
     * @dev Check if mech is in battle
     */
    function isMechInBattle(uint256 mechId) external view returns (bool) {
        return mechToBattle[mechId] != 0;
    }
    
    /**
     * @dev Get battle ID for mech
     */
    function getBattleForMech(uint256 mechId) external view returns (uint256) {
        return mechToBattle[mechId];
    }
    
    // Admin functions
    
    /**
     * @dev Set platform fee
     */
    function setPlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 20, "Fee too high");
        platformFeePercent = newFee;
    }
    
    /**
     * @dev Set min/max stake
     */
    function setStakeLimits(uint256 min, uint256 max) external onlyOwner {
        require(min < max, "Invalid limits");
        minStake = min;
        maxStake = max;
    }
    
    /**
     * @dev Pause/unpause battles
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Withdraw platform fees
     */
    function withdraw() external onlyOwner {
        (bool success, ) = payable(owner()).call{value: address(this).balance}("");
        require(success, "Withdraw failed");
    }
    
    /**
     * @dev Update mech NFT contract
     */
    function setMechNFT(address _mechNFT) external onlyOwner {
        mechNFT = IMechNFT(_mechNFT);
    }
    
    receive() external payable {}
}