# MechForge Web3 - 3D Mech Battling Game

[![Live Game](https://img.shields.io/badge/Live-Game-red)](https://mechforge-web3.vercel.app)
[![Base Sepolia](https://img.shields.io/badge/Base-Sepolia-0052FF)](https://sepolia.basescan.org)
[![3D Models](https://img.shields.io/badge/3D-GLB-orange)]()

## 🎯 Hackathon Submission - Synthesis 2026

**Track**: Gaming + Web3  
**Prize Pool**: $30,000+ (Synthesis Open, Base)

## 🎮 What It Does

MechForge is a **fully on-chain 3D mech battling game**. 

- Mint unique mech NFTs with procedural stats
- Battle other players in PvP combat
- Stake mechs to earn FORGE tokens
- True ownership - your mechs, forever

## 🚀 Live Game

**Play now**: https://mechforge-web3.vercel.app

### Quick Start
1. Connect MetaMask wallet
2. Mint your first mech (0.001 ETH)
3. Enter the Battle Arena
4. Stake to earn rewards

## 🏗️ Game Architecture

```
┌─────────────────────────────────────────────────────┐
│              Frontend (React Three Fiber)           │
│         - 3D mech viewer with Three.js              │
│         - Battle arena with animations              │
│         - Collection management                     │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│              Smart Contracts (Base)                 │
│  MechNFT.sol - ERC-721 mech minting                 │
│  BattleArena.sol - PvP battle resolution            │
│  StakingRewards.sol - Yield farming                 │
│  ForgeToken.sol - ERC-20 rewards                    │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│                3D Assets                            │
│   Omega, Vanguard, Scout, Striker mechs (GLB)       │
│   Idle, attack, victory animations                  │
└─────────────────────────────────────────────────────┘
```

## 📊 Smart Contracts (Base Sepolia)

| Contract | Address | Purpose |
|----------|---------|---------|
| **MechNFT** | `0x37921bf54dD7071419E30074DFaf0fE7c357d6bC` | Mech minting |
| **BattleArena** | `0xe8F45785b5D31098B3014c17A11A8C0a52326B8F` | PvP battles |
| **StakingRewards** | `0x609bDcB1B8940793604Bf36C976B7CCf45941C55` | Staking |
| **ForgeToken** | `0xECF2b91dcC6ec039c25c86B1235E80e609648dFA` | Rewards |

## 🎮 Game Mechanics

### Mech Types
| Type | Strength | Model |
|------|----------|-------|
| Assault | High attack | Omega |
| Tank | High defense | Vanguard |
| Scout | High speed | Scout |
| Sniper | Ranged damage | Striker |
| Support | Utility | Striker |

### Battle System
- Stake ETH to enter battle
- Winner takes 95% (5% platform fee)
- Provably fair on-chain resolution
- Real-time 3D battle visualization

### Staking
- Stake mechs to earn FORGE tokens
- 125% APR base rate
- Rarity multipliers (Common → Legendary)

## 🎥 Demo Video

**3-minute gameplay**: [YouTube Link](https://youtube.com/...)

### Demo Script
1. **0:00-0:30** - Epic mech intro
2. **0:30-1:30** - Mint mech + view in 3D
3. **1:30-2:30** - Battle demonstration
4. **2:30-3:00** - Staking and rewards

Full script: [DEMO_SCRIPT.md](./DEMO_SCRIPT.md)

## 🛠️ Tech Stack

- **Frontend**: React + Vite + React Three Fiber
- **3D**: Three.js + @react-three/drei
- **Web3**: wagmi + RainbowKit + ethers.js
- **Contracts**: Solidity + Hardhat
- **Network**: Base Sepolia

## 📈 Test Coverage

```
Contract Tests: 46/46 PASSING ✅
- MechNFT: All minting/stat tests
- BattleArena: All battle resolution tests
- StakingRewards: All yield tests
- ForgeToken: All ERC-20 tests

3D Assets: 8 GLB models + 10 animations ✅
```

## 🏆 Prize Tracks

| Track | Prize | Why We Win |
|-------|-------|------------|
| Synthesis Open | $28,133 | Complete game with 3D |
| Base | $1,666 | Native Base integration |

## 🚀 Future Roadmap

- [ ] Tournament mode
- [ ] Guild system
- [ ] Mobile app
- [ ] VR battles

## 📝 License

MIT License

**Play now**: https://mechforge-web3.vercel.app

**GitHub**: https://github.com/TheMasterClaw/mechforge-web3
