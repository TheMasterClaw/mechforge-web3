// IPFS Configuration for MechForge 3D Assets
// Update this file with your IPFS hashes after uploading to Pinata

export const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';

// Replace these empty strings with your actual IPFS hashes after uploading
// Format: 'Qm...'
export const MECH_MODELS_IPFS = {
  1: '', // Assault - omega_textured.glb
  2: '', // Tank - vanguard_textured.glb
  3: '', // Scout - scout_textured.glb
  4: '', // Sniper - striker_textured.glb
  5: '', // Support - striker_textured.glb
};

export const MECH_ANIMATIONS_IPFS = {
  1: { // Omega/Assault
    idle: '',     // omega_idle_pose.glb
    attack: '',   // omega_ultimate.glb
    entrance: '', // omega_entrance.glb
  },
  2: { // Vanguard/Tank
    idle: '',     // vanguard_idle.glb
    attack: '',   // vanguard_stomp.glb
    defense: '',  // vanguard_defense.glb
  },
  3: { // Scout (no animations yet)
    idle: '',
    attack: '',
  },
  4: { // Striker/Sniper
    idle: '',     // striker_combat.glb
    attack: '',   // striker_attack.glb
    victory: '',  // striker_victory.glb
  },
  5: { // Support (uses striker animations)
    idle: '',
    attack: '',
    victory: '',
  },
};

// Helper function to get the best available URL for a mech model
export function getMechModelUrl(mechType, preferIPFS = false) {
  const ipfsHash = MECH_MODELS_IPFS[mechType];
  
  if (preferIPFS && ipfsHash) {
    return `${IPFS_GATEWAY}${ipfsHash}`;
  }
  
  // Fallback to local paths
  const localPaths = {
    1: '/mechs/omega_textured.glb',
    2: '/mechs/vanguard_textured.glb',
    3: '/mechs/scout_textured.glb',
    4: '/mechs/striker_textured.glb',
    5: '/mechs/striker_textured.glb',
  };
  
  return localPaths[mechType] || localPaths[1];
}

// Helper function to get animation URL
export function getAnimationUrl(mechType, animationType, preferIPFS = false) {
  const animations = MECH_ANIMATIONS_IPFS[mechType];
  
  if (animations && animations[animationType]) {
    const ipfsHash = animations[animationType];
    if (preferIPFS && ipfsHash) {
      return `${IPFS_GATEWAY}${ipfsHash}`;
    }
  }
  
  // Fallback to local paths
  const localAnimationPaths = {
    1: {
      idle: '/animations/omega/omega_idle_pose.glb',
      attack: '/animations/omega/omega_ultimate.glb',
      entrance: '/animations/omega/omega_entrance.glb',
    },
    2: {
      idle: '/animations/vanguard/vanguard_idle.glb',
      attack: '/animations/vanguard/vanguard_stomp.glb',
      defense: '/animations/vanguard/vanguard_defense.glb',
    },
    4: {
      idle: '/animations/striker/striker_combat.glb',
      attack: '/animations/striker/striker_attack.glb',
      victory: '/animations/striker/striker_victory.glb',
    },
  };
  
  const mechAnims = localAnimationPaths[mechType];
  return mechAnims ? mechAnims[animationType] : null;
}

// Preload IPFS URLs for better performance
export function preloadIPFSUrls() {
  const urls = [
    ...Object.values(MECH_MODELS_IPFS).filter(Boolean),
    ...Object.values(MECH_ANIMATIONS_IPFS).flatMap(anims => Object.values(anims).filter(Boolean))
  ];
  
  urls.forEach(hash => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = `${IPFS_GATEWAY}${hash}`;
    link.as = 'fetch';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}
