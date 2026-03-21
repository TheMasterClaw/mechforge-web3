import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, ContactShadows, Html, useAnimations } from '@react-three/drei';
import { Loader2 } from 'lucide-react';
import * as THREE from 'three';

// IPFS Gateway configuration - using multiple fallbacks
const IPFS_GATEWAYS = [
  'https://gateway.pinata.cloud/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
];

// Helper to get IPFS URL with fallback
const getIPFSUrl = (cid, gatewayIndex = 0) => {
  if (!cid) return null;
  if (cid.startsWith('http')) return cid;
  if (cid.startsWith('ipfs://')) {
    const hash = cid.replace('ipfs://', '');
    return `${IPFS_GATEWAYS[gatewayIndex % IPFS_GATEWAYS.length]}${hash}`;
  }
  return `${IPFS_GATEWAYS[gatewayIndex % IPFS_GATEWAYS.length]}${cid}`;
};

// Mech type to model mapping - supports both local and IPFS
const MECH_MODELS = {
  1: '/mechs/omega_textured.glb',      // Assault
  2: '/mechs/vanguard_textured.glb',   // Tank
  3: '/mechs/scout_textured.glb',      // Scout
  4: '/mechs/striker_textured.glb',    // Sniper
  5: '/mechs/striker_textured.glb',    // Support (using striker as base)
};

// IPFS CIDs for mech models (placeholder - replace with actual CIDs)
const MECH_MODELS_IPFS = {
  1: null, // Replace with actual IPFS CID: 'Qm...'
  2: null,
  3: null,
  4: null,
  5: null,
};

// Loading fallback component
function LoadingFallback({ message = "Loading Mech..." }) {
  return (
    <Html center>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        color: '#00d4ff',
        fontFamily: "'Chakra Petch', sans-serif",
        fontSize: '0.875rem',
        textShadow: '0 0 10px rgba(0, 212, 255, 0.5)',
      }}>
        <Loader2 size={32} className="spin" style={{ marginBottom: '0.5rem' }} />
        <span>{message}</span>
      </div>
    </Html>
  );
}

// 3D Mech Model Component with animations
function MechModel({ 
  mechType, 
  animation = 'idle', 
  scale = 1, 
  rotation = [0, 0, 0], 
  position = [0, 0, 0], 
  onLoad,
  isAttacking = false,
  isHit = false,
  useIPFS = false,
}) {
  const modelPath = useIPFS && MECH_MODELS_IPFS[mechType] 
    ? getIPFSUrl(MECH_MODELS_IPFS[mechType])
    : MECH_MODELS[mechType] || MECH_MODELS[1];
    
  const { scene, animations } = useGLTF(modelPath);
  const mechRef = useRef();
  const [isLoaded, setIsLoaded] = useState(false);
  const { actions, mixer } = useAnimations(animations, mechRef);
  
  // Attack animation state
  const [attackProgress, setAttackProgress] = useState(0);

  useEffect(() => {
    if (scene && !isLoaded) {
      setIsLoaded(true);
      if (onLoad) onLoad();
    }
  }, [scene, isLoaded, onLoad]);

  useEffect(() => {
    if (mechRef.current) {
      mechRef.current.rotation.set(...rotation);
      mechRef.current.position.set(...position);
    }
  }, [rotation, position]);

  // Handle animations
  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      // Stop all current animations
      Object.values(actions).forEach(action => action.stop());
      
      // Play appropriate animation
      const actionName = animation === 'attack' ? 'Attack' : 'Idle';
      if (actions[actionName]) {
        actions[actionName].play();
      } else {
        // Fallback to first available animation
        const firstAction = Object.values(actions)[0];
        if (firstAction) firstAction.play();
      }
    }
  }, [actions, animation]);

  // Attack animation frame updates
  useFrame((state, delta) => {
    if (isAttacking && mechRef.current) {
      setAttackProgress(prev => {
        const newProgress = prev + delta * 3;
        if (newProgress >= Math.PI * 2) {
          return 0;
        }
        
        // Lunge forward during attack
        const lunge = Math.sin(newProgress) * 0.5;
        mechRef.current.position.x = position[0] + lunge;
        
        return newProgress;
      });
    }
    
    // Hit reaction
    if (isHit && mechRef.current) {
      mechRef.current.material = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 0.5,
      });
      
      setTimeout(() => {
        if (mechRef.current) {
          mechRef.current.material = null;
        }
      }, 200);
    }
  });

  // Clone the scene to avoid sharing issues
  const clonedScene = scene.clone();
  
  // Apply neon glow effect to materials
  clonedScene.traverse((child) => {
    if (child.isMesh) {
      child.material = child.material.clone();
      if (child.material.emissive) {
        child.material.emissiveIntensity = 0.2;
      }
    }
  });

  return (
    <primitive 
      ref={mechRef}
      object={clonedScene} 
      scale={scale}
      dispose={null}
    />
  );
}

// Scene setup component with enhanced lighting
function MechScene({ 
  mechType, 
  animation, 
  scale, 
  rotation, 
  position, 
  onLoad,
  isAttacking = false,
  isHit = false,
  useIPFS = false,
}) {
  const groupRef = useRef();
  
  // Subtle idle animation
  useFrame((state) => {
    if (groupRef.current && !isAttacking) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Enhanced Lighting Setup */}
      <ambientLight intensity={0.3} />
      
      {/* Main directional light */}
      <directionalLight 
        position={[5, 10, 7]} 
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      {/* Cyan rim light */}
      <directionalLight 
        position={[-5, 5, -5]} 
        intensity={0.8}
        color="#00d4ff"
      />
      
      {/* Orange accent light */}
      <directionalLight 
        position={[5, 0, -5]} 
        intensity={0.5}
        color="#ff6b35"
      />
      
      {/* Purple fill light */}
      <pointLight position={[0, 5, 5]} intensity={0.4} color="#c084fc" />
      
      {/* Ground reflection */}
      <pointLight position={[0, -2, 0]} intensity={0.3} color="#6366f1" />
      
      {/* Environment */}
      <Environment preset="city" />
      
      {/* Mech Model */}
      <Suspense fallback={<LoadingFallback />}>
        <MechModel 
          mechType={mechType} 
          animation={animation}
          scale={scale}
          rotation={rotation}
          position={[0, 0, 0]}
          onLoad={onLoad}
          isAttacking={isAttacking}
          isHit={isHit}
          useIPFS={useIPFS}
        />
        <ContactShadows 
          position={[0, -1.5, 0]} 
          opacity={0.6}
          scale={10}
          blur={2}
          far={4}
        />
        
        {/* Glow plane under mech */}
        <mesh position={[0, -1.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[2, 32]} />
          <meshBasicMaterial 
            color="#00d4ff" 
            transparent 
            opacity={0.1} 
          />
        </mesh>
      </Suspense>
      
      {/* Controls */}
      <OrbitControls 
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2}
        autoRotate
        autoRotateSpeed={1}
      />
    </group>
  );
}

// Main Mech3DViewer Component
export default function Mech3DViewer({ 
  mechType = 1, 
  animation = 'idle',
  scale = 1.5,
  rotation = [0, 0, 0],
  position = [0, -1, 0],
  height = '100%',
  width = '100%',
  onLoad,
  className = '',
  isAttacking = false,
  isHit = false,
  useIPFS = false,
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const handleLoad = () => {
    setIsLoading(false);
    if (onLoad) onLoad();
  };

  const handleError = (error) => {
    console.error('Failed to load mech model:', error);
    setLoadError('Failed to load 3D model');
    setIsLoading(false);
  };

  return (
    <div 
      className={`mech-3d-viewer ${className}`}
      style={{ 
        height, 
        width, 
        position: 'relative',
        borderRadius: 'inherit',
        overflow: 'hidden'
      }}
    >
      {/* Loading Overlay */}
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(10, 10, 20, 0.9)',
          zIndex: 10,
          borderRadius: 'inherit',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            color: '#00d4ff',
          }}>
            <Loader2 size={40} className="spin" />
            <span style={{
              fontFamily: "'Chakra Petch', sans-serif",
              fontSize: '0.875rem',
              textShadow: '0 0 10px rgba(0, 212, 255, 0.5)',
            }}>
              Loading Mech...
            </span>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {loadError && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(10, 10, 20, 0.9)',
          zIndex: 10,
          borderRadius: 'inherit',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            color: '#ff6b6b',
            padding: '1rem',
            textAlign: 'center',
          }}>
            <span style={{ fontSize: '2rem' }}>⚠️</span>
            <span style={{
              fontFamily: "'Chakra Petch', sans-serif",
              fontSize: '0.875rem',
            }}>
              {loadError}
            </span>
          </div>
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 1, 4], fov: 45 }}
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        onError={handleError}
      >
        <MechScene 
          mechType={mechType}
          animation={animation}
          scale={scale}
          rotation={rotation}
          position={position}
          onLoad={handleLoad}
          isAttacking={isAttacking}
          isHit={isHit}
          useIPFS={useIPFS}
        />
      </Canvas>
    </div>
  );
}

// Battle Mech Component - For showing two mechs facing each other
export function BattleMech({ 
  mechType, 
  isOpponent = false,
  animation = 'idle',
  isAttacking = false,
  isHit = false,
  onLoad,
  useIPFS = false,
}) {
  const [isLoading, setIsLoading] = useState(true);
  
  // Position mechs facing each other
  const position = isOpponent ? [2, -1, 0] : [-2, -1, 0];
  const rotation = isOpponent ? [0, -Math.PI / 2, 0] : [0, Math.PI / 2, 0];
  const scale = 1.2;

  const handleLoad = () => {
    setIsLoading(false);
    if (onLoad) onLoad();
  };

  return (
    <div style={{
      position: 'absolute',
      left: isOpponent ? '60%' : '10%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      width: '40%',
      height: '60%',
    }}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#00d4ff',
          fontFamily: "'Chakra Petch', sans-serif",
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <Loader2 size={24} className="spin" />
          <span style={{ fontSize: '0.75rem' }}>Loading...</span>
        </div>
      )}
      
      <Canvas
        camera={{ position: [0, 0.5, 3], fov: 50 }}
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
        <directionalLight 
          position={[-5, 5, -5]} 
          intensity={0.6} 
          color={isOpponent ? '#ff6b35' : '#00d4ff'} 
        />
        <Environment preset="city" />
        
        <Suspense fallback={null}>
          <MechModel 
            mechType={mechType}
            animation={isAttacking ? 'attack' : animation}
            scale={scale}
            rotation={rotation}
            position={position}
            onLoad={handleLoad}
            isAttacking={isAttacking}
            isHit={isHit}
            useIPFS={useIPFS}
          />
          <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={8} blur={1} far={3} />
        </Suspense>
        
        <OrbitControls enablePan={false} enableZoom={false} enableRotate={false} />
      </Canvas>
    </div>
  );
}

// Preload all mech models
export function preloadMechs(useIPFS = false) {
  if (useIPFS) {
    Object.values(MECH_MODELS_IPFS).forEach(cid => {
      if (cid) useGLTF.preload(getIPFSUrl(cid));
    });
  } else {
    Object.values(MECH_MODELS).forEach(path => {
      useGLTF.preload(path);
    });
  }
}
