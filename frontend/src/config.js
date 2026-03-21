import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia } from 'wagmi/chains';
import { http } from 'wagmi';

export const config = getDefaultConfig({
  appName: 'MechForge',
  projectId: 'mechforge-web3-game',
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http('https://sepolia.base.org'),
  },
});

// Contract ABIs (simplified for frontend)
export const MECH_NFT_ABI = [
  {
    "inputs": [{"internalType": "string", "name": "baseURI", "type": "string"}],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "quantity", "type": "uint256"}],
    "name": "mint",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
    "name": "getMechsByOwner",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "getMechStats",
    "outputs": [{
      "components": [
        {"internalType": "uint256", "name": "attack", "type": "uint256"},
        {"internalType": "uint256", "name": "defense", "type": "uint256"},
        {"internalType": "uint256", "name": "speed", "type": "uint256"},
        {"internalType": "uint256", "name": "health", "type": "uint256"},
        {"internalType": "uint256", "name": "energy", "type": "uint256"},
        {"internalType": "uint256", "name": "level", "type": "uint256"},
        {"internalType": "uint256", "name": "experience", "type": "uint256"},
        {"internalType": "uint256", "name": "battlesWon", "type": "uint256"},
        {"internalType": "uint256", "name": "battlesLost", "type": "uint256"},
        {"internalType": "uint256", "name": "mechType", "type": "uint256"},
        {"internalType": "uint256", "name": "rarity", "type": "uint256"},
        {"internalType": "bool", "name": "staked", "type": "bool"}
      ],
      "internalType": "struct MechNFT.MechStats",
      "name": "",
      "type": "tuple"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "ownerOf",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MINT_PRICE",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "tokenURI",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  }
];

export const BATTLE_ARENA_ABI = [
  {
    "inputs": [{"internalType": "uint256", "name": "mechId", "type": "uint256"}],
    "name": "createBattle",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "battleId", "type": "uint256"},
      {"internalType": "uint256", "name": "mechId", "type": "uint256"}
    ],
    "name": "joinBattle",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "battleId", "type": "uint256"}],
    "name": "getBattle",
    "outputs": [{
      "components": [
        {"internalType": "uint256", "name": "battleId", "type": "uint256"},
        {"internalType": "address", "name": "challenger", "type": "address"},
        {"internalType": "uint256", "name": "challengerMechId", "type": "uint256"},
        {"internalType": "address", "name": "defender", "type": "address"},
        {"internalType": "uint256", "name": "defenderMechId", "type": "uint256"},
        {"internalType": "uint256", "name": "stakeAmount", "type": "uint256"},
        {"internalType": "uint256", "name": "startTime", "type": "uint256"},
        {"internalType": "enum BattleArena.BattleStatus", "name": "status", "type": "uint8"},
        {"internalType": "address", "name": "winner", "type": "address"},
        {"internalType": "uint256[]", "name": "roundResults", "type": "uint256[]"}
      ],
      "internalType": "struct BattleArena.Battle",
      "name": "",
      "type": "tuple"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "player", "type": "address"}],
    "name": "getPlayerStats",
    "outputs": [
      {"internalType": "uint256", "name": "wins", "type": "uint256"},
      {"internalType": "uint256", "name": "losses", "type": "uint256"},
      {"internalType": "uint256", "name": "earnings", "type": "uint256"},
      {"internalType": "uint256", "name": "winRate", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "start", "type": "uint256"},
               {"internalType": "uint256", "name": "count", "type": "uint256"}],
    "name": "getPendingBattles",
    "outputs": [{
      "components": [
        {"internalType": "uint256", "name": "battleId", "type": "uint256"},
        {"internalType": "address", "name": "challenger", "type": "address"},
        {"internalType": "uint256", "name": "challengerMechId", "type": "uint256"},
        {"internalType": "address", "name": "defender", "type": "address"},
        {"internalType": "uint256", "name": "defenderMechId", "type": "uint256"},
        {"internalType": "uint256", "name": "stakeAmount", "type": "uint256"},
        {"internalType": "uint256", "name": "startTime", "type": "uint256"},
        {"internalType": "enum BattleArena.BattleStatus", "name": "status", "type": "uint8"},
        {"internalType": "address", "name": "winner", "type": "address"},
        {"internalType": "uint256[]", "name": "roundResults", "type": "uint256[]"}
      ],
      "internalType": "struct BattleArena.Battle[]",
      "name": "",
      "type": "tuple[]"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "minStake",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "mechId", "type": "uint256"}],
    "name": "isMechInBattle",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  }
];

export const STAKING_REWARDS_ABI = [
  {
    "inputs": [{"internalType": "uint256", "name": "mechId", "type": "uint256"}],
    "name": "stake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "mechId", "type": "uint256"}],
    "name": "unstake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "mechId", "type": "uint256"}],
    "name": "claimRewards",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserStakes",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "mechId", "type": "uint256"}],
    "name": "calculatePendingRewards",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "calculateTotalPendingRewards",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "mechId", "type": "uint256"}],
    "name": "isStaked",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "mechId", "type": "uint256"}],
    "name": "getStakeInfo",
    "outputs": [{
      "components": [
        {"internalType": "uint256", "name": "mechId", "type": "uint256"},
        {"internalType": "address", "name": "owner", "type": "address"},
        {"internalType": "uint256", "name": "stakedAt", "type": "uint256"},
        {"internalType": "uint256", "name": "lastClaimTime", "type": "uint256"},
        {"internalType": "uint256", "name": "accumulatedRewards", "type": "uint256"},
        {"internalType": "bool", "name": "active", "type": "bool"}
      ],
      "internalType": "struct StakingRewards.StakeInfo",
      "name": "",
      "type": "tuple"
    }],
    "stateMutability": "view",
    "type": "function"
  }
];

export const FORGE_TOKEN_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "to", "type": "address"},
               {"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "transfer",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Contract addresses - will be updated after deployment
export const CONTRACTS = {
  baseSepolia: {
    MechNFT: null,      // Will be filled after deployment
    BattleArena: null,
    StakingRewards: null,
    ForgeToken: null
  }
};

// Load deployed contracts if available
try {
  const response = await fetch('/contracts.json');
  if (response.ok) {
    const data = await response.json();
    if (data.contracts) {
      CONTRACTS.baseSepolia.MechNFT = data.contracts.MechNFT;
      CONTRACTS.baseSepolia.BattleArena = data.contracts.BattleArena;
      CONTRACTS.baseSepolia.StakingRewards = data.contracts.StakingRewards;
      CONTRACTS.baseSepolia.ForgeToken = data.contracts.ForgeToken;
    }
  }
} catch (e) {
  console.log('No deployed contracts found, using placeholders');
}