#!/bin/bash
# MechForge Demo Script
# This script demonstrates the complete MechForge workflow

echo "🤖 MechForge Web3 - Demo Script"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Step 1: Environment Check${NC}"
echo "---------------------------"
echo "Checking Node.js version:"
node --version
echo ""

echo -e "${BLUE}Step 2: Install Dependencies${NC}"
echo "---------------------------"
echo "Running: npm install"
npm install
echo ""

echo -e "${BLUE}Step 3: Run Contract Tests${NC}"
echo "---------------------------"
echo "Running: cd contracts && npm test"
cd contracts && npm test
echo ""

echo -e "${BLUE}Step 4: Compile Contracts${NC}"
echo "---------------------------"
echo "Running: npm run compile"
npm run compile
echo ""

echo -e "${BLUE}Step 5: Build Frontend${NC}"
echo "---------------------------"
echo "Running: cd ../frontend && npm run build"
cd ../frontend && npm run build
echo ""

echo -e "${GREEN}✅ Demo Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Run 'npm run dev' to start the development server"
echo "2. Open http://localhost:5173 in your browser"
echo "3. Connect your wallet (Base Sepolia)"
echo "4. Try minting, battling, and staking!"
echo ""
echo "Live deployment: https://mechforge-web3.vercel.app"
