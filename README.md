# MechForge Web3

Blockchain mech battling game with NFTs.

## 🎯 Hackathon Submissions

| Hackathon | Prize | Deadline | Status |
|-----------|-------|----------|--------|
| ETHGlobal London | $50K | Mar 28-30 | 🚧 Building |
| Solana AI | $20K | Apr 11-18 | ⏳ Planned |
| ETHGlobal Tokyo | $50K | Apr 25-27 | ⏳ Planned |
| ETHGlobal Brussels | $50K | Jul 2026 | ⏳ Planned |

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         React Three Fiber UI            │
│  - 3D Mech viewer                       │
│  - Battle arena                         │
│  - Equipment crafting                   │
└──────────────────┬──────────────────────┘
                   │ Ethers.js
┌──────────────────▼──────────────────────┐
│        Smart Contracts (Solidity)       │
│  - Mech NFT contract                    │
│  - Battle resolver                      │
│  - Equipment crafting                   │
│  - Staking & rewards                    │
└─────────────────────────────────────────┘
```

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Deploy contracts
cd contracts
npx hardhat run scripts/deploy.js --network base-sepolia
```

## 📁 Structure

```
mechforge-web3/
├── src/               # React components
├── contracts/         # Solidity smart contracts
├── public/            # Static assets (mech GLBs)
├── docs/              # Documentation
└── README.md
```
