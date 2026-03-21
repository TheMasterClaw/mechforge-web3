#!/bin/bash

# Pinata IPFS Upload Helper for MechForge 3D Assets
# This script generates curl commands to upload files to Pinata
# 
# IMPORTANT: You need both API Key and Secret Key from Pinata
# Sign up at: https://app.pinata.cloud
#
# Usage:
# 1. Set your Pinata credentials below
# 2. Run: bash scripts/upload-ipfs-manual.sh
# 3. Copy the generated hashes into src/config/ipfs.js

# ===== CONFIGURATION =====
# Replace these with your actual Pinata credentials
PINATA_API_KEY="0677124828904f06a14e"
PINATA_SECRET_KEY="YOUR_SECRET_KEY_HERE"  # Get this from Pinata dashboard

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  MechForge IPFS Upload Helper${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if secret key is set
if [ "$PINATA_SECRET_KEY" = "YOUR_SECRET_KEY_HERE" ]; then
    echo -e "${RED}ERROR: Please set your Pinata Secret Key!${NC}"
    echo ""
    echo "To get your Secret Key:"
    echo "1. Go to https://app.pinata.cloud"
    echo "2. Click 'API Keys' in the left sidebar"
    echo "3. Create a new key or view existing keys"
    echo "4. Copy the 'Secret Key' value"
    echo "5. Edit this script and set PINATA_SECRET_KEY"
    echo ""
    exit 1
fi

# Output file for results
RESULTS_FILE="scripts/ipfs-hashes.json"
echo "{\"mechs\":{},\"animations\":{},\"gateway\":\"https://gateway.pinata.cloud/ipfs/\"}" > "$RESULTS_FILE"

echo -e "${YELLOW}Uploading Mech Models...${NC}"
echo ""

# Upload mechs
MECHS_DIR="frontend/public/mechs"
for file in "$MECHS_DIR"/*.glb; do
    filename=$(basename "$file")
    echo -e "${BLUE}Uploading:${NC} $filename"
    
    # Generate curl command
    echo "curl -X POST \\"
    echo "  https://api.pinata.cloud/pinning/pinFileToIPFS \\"
    echo "  -H 'pinata_api_key: $PINATA_API_KEY' \\"
    echo "  -H 'pinata_secret_api_key: $PINATA_SECRET_KEY' \\"
    echo "  -F 'file=@$file' \\"
    echo "  -F 'pinataMetadata={\"name\":\"MechForge - $filename\",\"keyvalues\":{\"type\":\"mech\",\"project\":\"MechForge\"}}'"
    echo ""
done

echo ""
echo -e "${YELLOW}Uploading Animations...${NC}"
echo ""

# Upload animations
ANIMATIONS_DIR="frontend/public/animations"
for folder in "$ANIMATIONS_DIR"/*/; do
    foldername=$(basename "$folder")
    echo -e "${BLUE}Folder:${NC} $foldername"
    
    for file in "$folder"*.glb; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            echo -e "  ${BLUE}Uploading:${NC} $filename"
            
            # Generate curl command
            echo "  curl -X POST \\"
            echo "    https://api.pinata.cloud/pinning/pinFileToIPFS \\"
            echo "    -H 'pinata_api_key: $PINATA_API_KEY' \\"
            echo "    -H 'pinata_secret_api_key: $PINATA_SECRET_KEY' \\"
            echo "    -F 'file=@$file' \\"
            echo "    -F 'pinataMetadata={\"name\":\"MechForge - $foldername/$filename\",\"keyvalues\":{\"type\":\"animation\",\"mechType\":\"$foldername\",\"project\":\"MechForge\"}}'"
            echo ""
        fi
    done
done

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Upload Instructions${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Copy and run the curl commands above to upload each file."
echo ""
echo "After uploading, Pinata will return JSON with an 'IpfsHash' field."
echo "Copy those hashes and update frontend/src/config/ipfs.js:"
echo ""
echo "Example response:"
echo '{"IpfsHash":"QmXxxx...","PinSize":12345,"Timestamp":"2024-..."}'
echo ""
echo "Update ipfs.js like this:"
echo "  MECH_MODELS_IPFS[1] = 'QmXxxx...'; // omega_textured.glb"
echo ""
echo -e "${YELLOW}Then set USE_IPFS = true in Mech3DViewer.jsx${NC}"
echo ""
