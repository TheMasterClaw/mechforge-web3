# IPFS Setup for MechForge 3D Assets

This document explains how to upload the 3D mech models to IPFS using Pinata for reliable, decentralized hosting.

## Why IPFS?

- **Decentralized**: Files remain available even if your server goes down
- **Content-addressed**: Files are identified by their hash (Qm...), guaranteeing integrity
- **CDN-like**: Pinata's gateway provides fast global access
- **Permanent**: Once pinned, files stay on IPFS forever

## Prerequisites

1. Sign up for a free Pinata account: https://app.pinata.cloud
2. Get your API credentials from the dashboard
3. Install dependencies: `npm install axios form-data`

## Upload Methods

### Method 1: Pinata Web Interface (Easiest)

1. Go to https://app.pinata.cloud/pinmanager
2. Click "Upload" → "File"
3. Upload each GLB file one by one
4. Copy the IPFS hash (starts with Qm...)
5. Update `frontend/src/config/ipfs.js` with the hashes

### Method 2: Using curl

For each file, run:

```bash
curl -X POST \
  https://api.pinata.cloud/pinning/pinFileToIPFS \
  -H "pinata_api_key: YOUR_API_KEY" \
  -H "pinata_secret_api_key: YOUR_SECRET_KEY" \
  -F "file=@frontend/public/mechs/omega_textured.glb" \
  -F 'pinataMetadata={"name":"MechForge - omega_textured.glb","keyvalues":{"type":"mech"}}'
```

### Method 3: Node.js Script

Use the provided upload script:

```bash
cd frontend/scripts
node upload-ipfs.cjs
```

**Note**: The script requires both API Key and Secret Key from your Pinata dashboard.

## Files to Upload

### Mech Models (in `frontend/public/mechs/`)

| File | Type | Purpose |
|------|------|---------|
| omega_textured.glb | Assault | Type 1 mech |
| vanguard_textured.glb | Tank | Type 2 mech |
| scout_textured.glb | Scout | Type 3 mech |
| striker_textured.glb | Sniper/Support | Type 4/5 mech |

### Animations (in `frontend/public/animations/`)

| Folder | Files |
|--------|-------|
| omega/ | omega_idle_pose.glb, omega_ultimate.glb, omega_entrance.glb |
| vanguard/ | vanguard_idle.glb, vanguard_stomp.glb, vanguard_defense.glb |
| striker/ | striker_combat.glb, striker_attack.glb, striker_victory.glb |

## Configuration

After uploading, update `frontend/src/config/ipfs.js`:

```javascript
export const MECH_MODELS_IPFS = {
  1: 'QmYourHashHere', // omega_textured.glb
  2: 'QmYourHashHere', // vanguard_textured.glb
  3: 'QmYourHashHere', // scout_textured.glb
  4: 'QmYourHashHere', // striker_textured.glb
  5: 'QmYourHashHere', // striker_textured.glb (support)
};
```

Then enable IPFS in `frontend/src/components/Mech3DViewer.jsx`:

```javascript
const USE_IPFS = true; // Set to true after uploading to Pinata
```

## Gateway URLs

Once uploaded, access files via:

```
https://gateway.pinata.cloud/ipfs/QmYourHashHere
```

Or use other public gateways:
- `https://ipfs.io/ipfs/Qm...`
- `https://cloudflare-ipfs.com/ipfs/Qm...`
- `https://gateway.ipfs.io/ipfs/Qm...`

## Testing

After configuration, test loading:

1. Open browser DevTools Network tab
2. Look for requests to `gateway.pinata.cloud`
3. Verify 3D models load correctly
4. Check that fallback to local files works if IPFS fails

## Troubleshooting

### Models not loading from IPFS
- Check that hashes are correct in `ipfs.js`
- Verify `USE_IPFS = true` in Mech3DViewer.jsx
- Check browser console for CORS errors
- Try a different IPFS gateway

### Slow loading
- IPFS can be slower than local files
- Keep local fallbacks enabled
- Consider using a dedicated IPFS gateway

### Pinata rate limits
- Free tier: 100 pins/month, 1GB storage
- Paid plans available for more capacity
