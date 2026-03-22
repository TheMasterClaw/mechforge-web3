import { useAccount, useReadContract } from 'wagmi';
import { useState, useEffect, Suspense, lazy } from 'react';
import { Shield, AlertCircle, Zap, Target, Heart, Wind, Loader2 } from 'lucide-react';
import { MECH_NFT_ABI, CONTRACTS } from '../config';

// Lazy load the 3D viewer for better performance
const Mech3DViewer = lazy(() => import('./Mech3DViewer'));

const MECH_TYPES = ['', '⚔️', '🛡️', '🚀', '🎯', '💚'];
const TYPE_NAMES = ['', 'Assault', 'Tank', 'Scout', 'Sniper', 'Support'];

// Loading placeholder for 3D viewer
function MechLoadingPlaceholder() {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(255, 107, 53, 0.1))',
      borderRadius: '0.5rem',
    }}>
      <Loader2 size={32} className="spin" style={{ color: '#00d4ff' }} />
    </div>
  );
}

// Mech Card with 3D Preview
function MechCard({ mech, isSelected, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`mech-card ${mech.staked ? 'staked' : ''} ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered 
          ? '0 8px 32px rgba(0, 212, 255, 0.3)' 
          : isSelected 
            ? '0 0 20px rgba(0, 212, 255, 0.5)' 
            : '0 4px 16px rgba(0, 0, 0, 0.3)',
      }}
    >
      <div className="mech-image" style={{ 
        height: '200px',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '0.5rem 0.5rem 0 0',
      }}>
        <Suspense fallback={<MechLoadingPlaceholder />}>
          <Mech3DViewer 
            mechType={mech.mechType}
            animation="idle"
            scale={1.2}
            height="100%"
            width="100%"
          />
        </Suspense>
        
        <span className="mech-type-icon" style={{
          position: 'absolute',
          top: '0.5rem',
          left: '0.5rem',
          fontSize: '1.5rem',
          zIndex: 5,
          background: 'rgba(0, 0, 0, 0.6)',
          borderRadius: '50%',
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(4px)',
        }}>
          {MECH_TYPES[mech.mechType]}
        </span>
        
        {mech.staked && (
          <div className="staked-badge" style={{
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
            background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
            color: '#000',
            padding: '0.25rem 0.75rem',
            borderRadius: '1rem',
            fontSize: '0.7rem',
            fontWeight: 'bold',
            fontFamily: "'Chakra Petch', sans-serif",
            zIndex: 5,
          }}>
            STAKED
          </div>
        )}
        
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '40%',
          background: 'linear-gradient(to top, rgba(10, 10, 20, 0.9), transparent)',
          pointerEvents: 'none',
        }} />
      </div>
      
      <div className="mech-info" style={{ padding: '1rem' }}>
        <div className="mech-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.75rem',
        }}>
          <span className="mech-name" style={{
            fontFamily: "'Chakra Petch', sans-serif",
            fontSize: '1rem',
            fontWeight: 'bold',
            color: '#fff',
          }}>
            {TYPE_NAMES[mech.mechType]} #{mech.id}
          </span>
          <span className={`mech-rarity ${getRarityClass(mech.rarity)}`} style={{
            padding: '0.25rem 0.5rem',
            borderRadius: '0.25rem',
            fontSize: '0.7rem',
            fontWeight: 'bold',
            textTransform: 'uppercase',
          }}>
            {getRarityName(mech.rarity)}
          </span>
        </div>

        <div className="mech-stats" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '0.5rem',
          marginBottom: '0.75rem',
        }}>
          <div className="mech-stat" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.35rem 0.5rem',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '0.25rem',
            fontSize: '0.8rem',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#ff6b35' }}>
              <Zap size={14} /> ATK
            </span>
            <span style={{ fontWeight: 'bold', color: '#fff' }}>{mech.attack}</span>
          </div>
          <div className="mech-stat" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.35rem 0.5rem',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '0.25rem',
            fontSize: '0.8rem',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#00d4ff' }}>
              <Shield size={14} /> DEF
            </span>
            <span style={{ fontWeight: 'bold', color: '#fff' }}>{mech.defense}</span>
          </div>
          <div className="mech-stat" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.35rem 0.5rem',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '0.25rem',
            fontSize: '0.8rem',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#00ff88' }}>
              <Wind size={14} /> SPD
            </span>
            <span style={{ fontWeight: 'bold', color: '#fff' }}>{mech.speed}</span>
          </div>
          <div className="mech-stat" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.35rem 0.5rem',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '0.25rem',
            fontSize: '0.8rem',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#ff3366' }}>
              <Heart size={14} /> HP
            </span>
            <span style={{ fontWeight: 'bold', color: '#fff' }}>{mech.health}</span>
          </div>
        </div>

        <div className="mech-level" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.75rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '0.8rem',
          color: '#94a3b8',
        }}>
          <span>Level {mech.level}</span>
          <span>
            {mech.battlesWon}W / {mech.battlesLost}L ({getWinRate(mech.battlesWon, mech.battlesLost)}%)
          </span>
        </div>
      </div>
    </div>
  );
}

// Helper functions
const getRarityName = (rarity) => {
  const names = ['', 'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
  return names[rarity] || 'Unknown';
};

const getRarityClass = (rarity) => {
  const classes = ['', 'common', 'uncommon', 'rare', 'epic', 'legendary'];
  return classes[rarity] || 'common';
};

const getWinRate = (won, lost) => {
  const total = won + lost;
  return total > 0 ? Math.round((won / total) * 100) : 0;
};

export default function Collection() {
  const { address, isConnected } = useAccount();
  const [selectedMech, setSelectedMech] = useState(null);
  const [mechsData, setMechsData] = useState([]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Fetch mech IDs owned by user
  const { data: mechIds, isLoading: isLoadingIds, error: idsError } = useReadContract({
    address: CONTRACTS.baseSepolia.MechNFT,
    abi: MECH_NFT_ABI,
    functionName: 'getMechsByOwner',
    args: [address],
    query: { 
      enabled: isConnected && !!CONTRACTS.baseSepolia.MechNFT && !!address,
      refetchInterval: 10000
    }
  });

  // Fetch mech stats for each mech using individual contract calls
  useEffect(() => {
    if (!mechIds || mechIds.length === 0) {
      setMechsData([]);
      return;
    }

    const fetchMechData = async () => {
      setIsLoadingStats(true);
      const mechs = [];
      
      for (const id of mechIds) {
        try {
          // Create a temporary contract read for each mech's stats
          // In production, use multicall for efficiency
          const mechStats = await readMechStats(id);
          mechs.push({
            id: Number(id),
            mechType: Number(mechStats.mechType),
            rarity: Number(mechStats.rarity),
            level: Number(mechStats.level),
            attack: Number(mechStats.attack),
            defense: Number(mechStats.defense),
            speed: Number(mechStats.speed),
            health: Number(mechStats.health),
            energy: Number(mechStats.energy),
            battlesWon: Number(mechStats.battlesWon),
            battlesLost: Number(mechStats.battlesLost),
            staked: mechStats.staked,
          });
        } catch (e) {
          console.error(`Error fetching mech ${id}:`, e);
        }
      }
      
      setMechsData(mechs);
      setIsLoadingStats(false);
    };

    fetchMechData();
  }, [mechIds]);

  // Helper function to read mech stats from contract
  const readMechStats = async (tokenId) => {
    // For now, return placeholder - in production this would be a real contract call
    // This simulates what the contract would return
    return {
      attack: 50 + (Number(tokenId) % 50),
      defense: 50 + (Number(tokenId) % 40),
      speed: 50 + (Number(tokenId) % 30),
      health: 100 + (Number(tokenId) % 100),
      energy: 50,
      level: Math.floor(Number(tokenId) / 10) + 1,
      experience: 0,
      battlesWon: Math.floor(Number(tokenId) / 5),
      battlesLost: Math.floor(Number(tokenId) / 10),
      mechType: (Number(tokenId) % 5) + 1,
      rarity: (Number(tokenId) % 5) + 1,
      staked: Number(tokenId) % 3 === 0
    };
  };

  const displayMechs = mechsData;
  const isLoading = isLoadingIds || isLoadingStats;

  if (!isConnected) {
    return (
      <div className="empty-state" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem',
        textAlign: 'center',
      }}>
        <div className="empty-state-icon" style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔗</div>
        <h2 style={{ fontFamily: "'Chakra Petch', sans-serif", marginBottom: '0.5rem', color: '#fff' }}>Connect Your Wallet</h2>
        <p style={{ color: '#94a3b8' }}>Connect your wallet to view your mech collection</p>
      </div>
    );
  }

  const hasContracts = !!CONTRACTS.baseSepolia.MechNFT;
  const totalMechs = displayMechs.length;
  const stakedCount = displayMechs.filter(m => m.staked).length;
  const totalWins = displayMechs.reduce((acc, m) => acc + (m.battlesWon || 0), 0);
  const avgWinRate = totalMechs > 0 
    ? Math.round(displayMechs.reduce((acc, m) => acc + getWinRate(m.battlesWon || 0, m.battlesLost || 0), 0) / totalMechs)
    : 0;

  return (
    <>
      {idsError && (
        <div className="alert alert-warning" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1rem',
          background: 'rgba(255, 193, 7, 0.15)',
          border: '1px solid rgba(255, 193, 7, 0.4)',
          borderRadius: '0.5rem',
          marginBottom: '1.5rem',
          color: '#fbbf24',
        }}>
          <AlertCircle size={20} />
          <div>
            <strong>Error Loading Data</strong>
            <p style={{ margin: 0, marginTop: '0.25rem', color: '#fcd34d' }}>
              {idsError.message}
            </p>
          </div>
        </div>
      )}

      {!hasContracts && (
        <div className="alert alert-warning" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1rem',
          background: 'rgba(255, 193, 7, 0.15)',
          border: '1px solid rgba(255, 193, 7, 0.4)',
          borderRadius: '0.5rem',
          marginBottom: '1.5rem',
          color: '#fbbf24',
        }}>
          <AlertCircle size={20} />
          <div>
            <strong>Contracts Not Deployed</strong>
            <p style={{ margin: 0, marginTop: '0.25rem', color: '#fcd34d' }}>
              Please deploy contracts to Base Sepolia first.
            </p>
          </div>
        </div>
      )}

      <div className="stats-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <div className="stat-box" style={{
          background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(0, 212, 255, 0.05))',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          borderRadius: '0.5rem',
          padding: '1.25rem',
          textAlign: 'center',
        }}>
          <div className="stat-value" style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            fontFamily: "'Chakra Petch', sans-serif",
            color: '#00d4ff',
            textShadow: '0 0 10px rgba(0, 212, 255, 0.5)',
          }}>
            {isLoading ? <Loader2 size={24} className="spin" /> : totalMechs}
          </div>
          <div className="stat-label" style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.25rem' }}>Total Mechs</div>
        </div>
        
        <div className="stat-box" style={{
          background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.1), rgba(0, 255, 136, 0.05))',
          border: '1px solid rgba(0, 255, 136, 0.2)',
          borderRadius: '0.5rem',
          padding: '1.25rem',
          textAlign: 'center',
        }}>
          <div className="stat-value" style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            fontFamily: "'Chakra Petch', sans-serif",
            color: '#00ff88',
            textShadow: '0 0 10px rgba(0, 255, 136, 0.5)',
          }}>
            {isLoading ? <Loader2 size={24} className="spin" /> : stakedCount}
          </div>
          <div className="stat-label" style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.25rem' }}>Staked</div>
        </div>
        
        <div className="stat-box" style={{
          background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(255, 107, 53, 0.05))',
          border: '1px solid rgba(255, 107, 53, 0.2)',
          borderRadius: '0.5rem',
          padding: '1.25rem',
          textAlign: 'center',
        }}>
          <div className="stat-value" style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            fontFamily: "'Chakra Petch', sans-serif",
            color: '#ff6b35',
            textShadow: '0 0 10px rgba(255, 107, 53, 0.5)',
          }}>
            {isLoading ? <Loader2 size={24} className="spin" /> : totalWins}
          </div>
          <div className="stat-label" style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.25rem' }}>Battles Won</div>
        </div>
        
        <div className="stat-box" style={{
          background: 'linear-gradient(135deg, rgba(255, 51, 102, 0.1), rgba(255, 51, 102, 0.05))',
          border: '1px solid rgba(255, 51, 102, 0.2)',
          borderRadius: '0.5rem',
          padding: '1.25rem',
          textAlign: 'center',
        }}>
          <div className="stat-value" style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            fontFamily: "'Chakra Petch', sans-serif",
            color: '#ff3366',
            textShadow: '0 0 10px rgba(255, 51, 102, 0.5)',
          }}>
            {isLoading ? <Loader2 size={24} className="spin" /> : `${avgWinRate}%`}
          </div>
          <div className="stat-label" style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.25rem' }}>Avg Win Rate</div>
        </div>
      </div>

      {isLoading ? (
        <div className="loading" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '4rem',
        }}>
          <div className="spinner" style={{
            width: '48px',
            height: '48px',
            border: '3px solid rgba(0, 212, 255, 0.3)',
            borderTop: '3px solid #00d4ff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
        </div>
      ) : displayMechs.length === 0 ? (
        <div className="empty-state" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem',
          textAlign: 'center',
        }}>
          <div className="empty-state-icon" style={{ fontSize: '4rem', marginBottom: '1rem' }}>🤖</div>
          <h2 style={{ fontFamily: "'Chakra Petch', sans-serif", marginBottom: '0.5rem', color: '#fff' }}>No Mechs Yet</h2>
          <p style={{ color: '#94a3b8' }}>You don&apos;t have any mechs in your collection.</p>
          <button 
            className="btn btn-primary" 
            style={{ marginTop: '1rem' }}
            onClick={() => window.dispatchEvent(new CustomEvent('setTab', { detail: 'mint' }))}
          >
            Mint Your First Mech
          </button>
        </div>
      ) : (
        <div className="grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem',
        }}>
          {displayMechs.map((mech) => (
            <MechCard 
              key={mech.id}
              mech={mech}
              isSelected={selectedMech === mech.id}
              onClick={() => setSelectedMech(selectedMech === mech.id ? null : mech.id)}
            />
          ))}
        </div>
      )}
    </>
  );
}
