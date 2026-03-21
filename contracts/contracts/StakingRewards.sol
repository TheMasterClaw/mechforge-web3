// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IMechNFT.sol";

/**
 * @title StakingRewards
 * @dev Staking contract for MechForge - stake mechs to earn rewards
 */
contract StakingRewards is Ownable, ReentrancyGuard, Pausable {
    
    IMechNFT public mechNFT;
    IERC20 public rewardToken;
    
    // Stake info
    struct StakeInfo {
        uint256 mechId;
        address owner;
        uint256 stakedAt;
        uint256 lastClaimTime;
        uint256 accumulatedRewards;
        bool active;
    }
    
    // Staking state
    mapping(uint256 => StakeInfo) public stakes; // mechId => stake info
    mapping(address => uint256[]) public userStakes; // user => array of staked mech IDs
    mapping(uint256 => uint256) public mechStakeIndex; // mechId => index in userStakes array
    
    // Reward rates (tokens per day per mech, scaled by 1e18)
    uint256 public baseRewardRate = 10 * 10**18; // 10 tokens per day
    uint256 public constant REWARD_PRECISION = 1e18;
    uint256 public constant SECONDS_PER_DAY = 86400;
    
    // Rarity multipliers (in percentage)
    mapping(uint256 => uint256) public rarityMultiplier; // rarity => multiplier%
    
    // Total staked
    uint256 public totalStaked;
    uint256 public totalRewardsDistributed;
    
    // Emergency unlock
    bool public emergencyUnlock;
    
    // Events
    event Staked(address indexed user, uint256 indexed mechId, uint256 timestamp);
    event Unstaked(address indexed user, uint256 indexed mechId, uint256 timestamp, uint256 rewards);
    event RewardsClaimed(address indexed user, uint256 indexed mechId, uint256 amount);
    event RewardRateUpdated(uint256 newRate);
    
    modifier onlyMechOwner(uint256 mechId) {
        require(mechNFT.ownerOf(mechId) == msg.sender, "Not mech owner");
        _;
    }
    
    modifier validStake(uint256 mechId) {
        require(stakes[mechId].active, "Not staked");
        require(stakes[mechId].owner == msg.sender, "Not stake owner");
        _;
    }
    
    constructor(address _mechNFT, address _rewardToken) Ownable(msg.sender) {
        mechNFT = IMechNFT(_mechNFT);
        rewardToken = IERC20(_rewardToken);
        
        // Set rarity multipliers
        rarityMultiplier[1] = 100; // Common: 100%
        rarityMultiplier[2] = 125; // Uncommon: 125%
        rarityMultiplier[3] = 150; // Rare: 150%
        rarityMultiplier[4] = 200; // Epic: 200%
        rarityMultiplier[5] = 300; // Legendary: 300%
    }
    
    /**
     * @dev Stake a mech to earn rewards
     * @param mechId The mech ID to stake
     */
    function stake(uint256 mechId) 
        external 
        nonReentrant 
        whenNotPaused
        onlyMechOwner(mechId)
    {
        require(!stakes[mechId].active, "Already staked");
        
        // Update mech NFT staked status
        mechNFT.setStaked(mechId, true);
        
        // Create stake record
        stakes[mechId] = StakeInfo({
            mechId: mechId,
            owner: msg.sender,
            stakedAt: block.timestamp,
            lastClaimTime: block.timestamp,
            accumulatedRewards: 0,
            active: true
        });
        
        // Add to user's stakes
        userStakes[msg.sender].push(mechId);
        mechStakeIndex[mechId] = userStakes[msg.sender].length - 1;
        
        totalStaked++;
        
        emit Staked(msg.sender, mechId, block.timestamp);
    }
    
    /**
     * @dev Unstake a mech and claim rewards
     * @param mechId The mech ID to unstake
     */
    function unstake(uint256 mechId) 
        external 
        nonReentrant
        validStake(mechId)
    {
        _unstakeInternal(mechId);
    }
    
    /**
     * @dev Unstake multiple mechs
     * @param mechIds Array of mech IDs to unstake
     */
    function unstakeBatch(uint256[] calldata mechIds) external nonReentrant {
        for (uint256 i = 0; i < mechIds.length; i++) {
            if (stakes[mechIds[i]].active && stakes[mechIds[i]].owner == msg.sender) {
                _unstakeInternal(mechIds[i]);
            }
        }
    }
    
    /**
     * @dev Internal unstake function
     */
    function _unstakeInternal(uint256 mechId) internal {
        StakeInfo storage stakeInfo = stakes[mechId];
        
        // Calculate and claim pending rewards
        uint256 pendingRewards = calculatePendingRewards(mechId);
        uint256 totalRewards = stakeInfo.accumulatedRewards + pendingRewards;
        
        // Update mech NFT staked status
        mechNFT.setStaked(mechId, false);
        
        // Remove from user's stakes (swap and pop)
        uint256[] storage userStakeList = userStakes[msg.sender];
        uint256 index = mechStakeIndex[mechId];
        uint256 lastMechId = userStakeList[userStakeList.length - 1];
        
        userStakeList[index] = lastMechId;
        mechStakeIndex[lastMechId] = index;
        userStakeList.pop();
        
        delete mechStakeIndex[mechId];
        stakeInfo.active = false;
        
        totalStaked--;
        
        // Transfer rewards if any
        if (totalRewards > 0) {
            totalRewardsDistributed += totalRewards;
            require(rewardToken.transfer(msg.sender, totalRewards), "Reward transfer failed");
            emit RewardsClaimed(msg.sender, mechId, totalRewards);
        }
        
        emit Unstaked(msg.sender, mechId, block.timestamp, totalRewards);
    }
    
    /**
     * @dev Claim rewards without unstaking
     * @param mechId The mech ID to claim rewards for
     */
    function claimRewards(uint256 mechId) 
        external 
        nonReentrant
        validStake(mechId)
    {
        StakeInfo storage stakeInfo = stakes[mechId];
        
        uint256 pendingRewards = calculatePendingRewards(mechId);
        require(pendingRewards > 0, "No rewards to claim");
        
        stakeInfo.accumulatedRewards = 0;
        stakeInfo.lastClaimTime = block.timestamp;
        
        totalRewardsDistributed += pendingRewards;
        
        require(rewardToken.transfer(msg.sender, pendingRewards), "Reward transfer failed");
        
        emit RewardsClaimed(msg.sender, mechId, pendingRewards);
    }
    
    /**
     * @dev Claim rewards for multiple staked mechs
     * @param mechIds Array of mech IDs to claim for
     */
    function claimRewardsBatch(uint256[] calldata mechIds) external nonReentrant {
        uint256 totalRewards = 0;
        
        for (uint256 i = 0; i < mechIds.length; i++) {
            uint256 mechId = mechIds[i];
            StakeInfo storage stakeInfo = stakes[mechId];
            
            if (stakeInfo.active && stakeInfo.owner == msg.sender) {
                uint256 pendingRewards = calculatePendingRewards(mechId);
                if (pendingRewards > 0) {
                    stakeInfo.accumulatedRewards = 0;
                    stakeInfo.lastClaimTime = block.timestamp;
                    totalRewards += pendingRewards;
                    emit RewardsClaimed(msg.sender, mechId, pendingRewards);
                }
            }
        }
        
        if (totalRewards > 0) {
            totalRewardsDistributed += totalRewards;
            require(rewardToken.transfer(msg.sender, totalRewards), "Reward transfer failed");
        }
    }
    
    /**
     * @dev Calculate pending rewards for a staked mech
     * @param mechId The mech ID to calculate for
     * @return Pending reward amount
     */
    function calculatePendingRewards(uint256 mechId) public view returns (uint256) {
        StakeInfo memory stakeInfo = stakes[mechId];
        if (!stakeInfo.active) return 0;
        
        IMechNFT.MechStats memory stats = mechNFT.getMechStats(mechId);
        
        uint256 stakedDuration = block.timestamp - stakeInfo.lastClaimTime;
        uint256 daysStaked = (stakedDuration * REWARD_PRECISION) / SECONDS_PER_DAY;
        
        // Base rewards
        uint256 baseRewards = (baseRewardRate * daysStaked) / REWARD_PRECISION;
        
        // Apply rarity multiplier
        uint256 multiplier = rarityMultiplier[stats.rarity];
        uint256 adjustedRewards = (baseRewards * multiplier) / 100;
        
        // Level bonus (1% per level)
        uint256 levelBonus = (adjustedRewards * stats.level) / 100;
        
        return adjustedRewards + levelBonus + stakeInfo.accumulatedRewards;
    }
    
    /**
     * @dev Calculate total pending rewards for a user
     * @param user The user address
     * @return Total pending rewards
     */
    function calculateTotalPendingRewards(address user) external view returns (uint256) {
        uint256 total = 0;
        uint256[] memory userStakeList = userStakes[user];
        
        for (uint256 i = 0; i < userStakeList.length; i++) {
            total += calculatePendingRewards(userStakeList[i]);
        }
        
        return total;
    }
    
    /**
     * @dev Get stake info for a mech
     */
    function getStakeInfo(uint256 mechId) external view returns (StakeInfo memory) {
        return stakes[mechId];
    }
    
    /**
     * @dev Get all staked mechs for a user
     */
    function getUserStakes(address user) external view returns (uint256[] memory) {
        return userStakes[user];
    }
    
    /**
     * @dev Get detailed staking info for a user
     */
    function getUserStakingDetails(address user) external view returns (
        uint256[] memory mechIds,
        uint256[] memory pendingRewards,
        uint256[] memory stakedTimes
    ) {
        uint256[] memory userStakeList = userStakes[user];
        uint256 count = userStakeList.length;
        
        mechIds = new uint256[](count);
        pendingRewards = new uint256[](count);
        stakedTimes = new uint256[](count);
        
        for (uint256 i = 0; i < count; i++) {
            uint256 mechId = userStakeList[i];
            mechIds[i] = mechId;
            pendingRewards[i] = calculatePendingRewards(mechId);
            stakedTimes[i] = stakes[mechId].stakedAt;
        }
    }
    
    /**
     * @dev Check if mech is staked
     */
    function isStaked(uint256 mechId) external view returns (bool) {
        return stakes[mechId].active;
    }
    
    /**
     * @dev Get APR for a mech based on its stats
     */
    function calculateMechAPR(uint256 mechId) external view returns (uint256) {
        IMechNFT.MechStats memory stats = mechNFT.getMechStats(mechId);
        
        // Daily reward based on rarity and level
        uint256 dailyReward = (baseRewardRate * rarityMultiplier[stats.rarity]) / 100;
        dailyReward += (dailyReward * stats.level) / 100;
        
        // Estimate mech value (simplified)
        uint256 estimatedValue = 0.001 ether * stats.rarity;
        
        if (estimatedValue == 0) return 0;
        
        // APR = (Daily reward * 365) / Value * 100
        uint256 yearlyReward = dailyReward * 365;
        return (yearlyReward * 100 * 10**18) / estimatedValue;
    }
    
    // Admin functions
    
    /**
     * @dev Set base reward rate
     */
    function setBaseRewardRate(uint256 newRate) external onlyOwner {
        baseRewardRate = newRate;
        emit RewardRateUpdated(newRate);
    }
    
    /**
     * @dev Set rarity multiplier
     */
    function setRarityMultiplier(uint256 rarity, uint256 multiplier) external onlyOwner {
        require(rarity >= 1 && rarity <= 5, "Invalid rarity");
        rarityMultiplier[rarity] = multiplier;
    }
    
    /**
     * @dev Update reward token
     */
    function setRewardToken(address _rewardToken) external onlyOwner {
        rewardToken = IERC20(_rewardToken);
    }
    
    /**
     * @dev Update mech NFT contract
     */
    function setMechNFT(address _mechNFT) external onlyOwner {
        mechNFT = IMechNFT(_mechNFT);
    }
    
    /**
     * @dev Emergency unstake (in case of issues)
     */
    function emergencyUnstake(uint256 mechId) external {
        require(emergencyUnlock || msg.sender == owner(), "Emergency not active");
        require(stakes[mechId].active, "Not staked");
        
        StakeInfo storage stakeInfo = stakes[mechId];
        address owner = stakeInfo.owner;
        
        mechNFT.setStaked(mechId, false);
        stakeInfo.active = false;
        
        // Remove from user's stakes
        uint256[] storage userStakeList = userStakes[owner];
        uint256 index = mechStakeIndex[mechId];
        uint256 lastMechId = userStakeList[userStakeList.length - 1];
        
        userStakeList[index] = lastMechId;
        mechStakeIndex[lastMechId] = index;
        userStakeList.pop();
        
        delete mechStakeIndex[mechId];
        totalStaked--;
        
        emit Unstaked(owner, mechId, block.timestamp, 0);
    }
    
    /**
     * @dev Toggle emergency unlock
     */
    function setEmergencyUnlock(bool enabled) external onlyOwner {
        emergencyUnlock = enabled;
    }
    
    /**
     * @dev Pause/unpause staking
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Deposit reward tokens
     */
    function depositRewards(uint256 amount) external onlyOwner {
        require(rewardToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
    }
    
    /**
     * @dev Withdraw excess reward tokens
     */
    function withdrawRewards(uint256 amount) external onlyOwner {
        require(rewardToken.transfer(msg.sender, amount), "Withdraw failed");
    }
    
    /**
     * @dev Fund contract with ETH (for emergencies)
     */
    receive() external payable {}
}