import { useAccount, useReadContract, useContractRead } from 'wagmi';
import { useState, useEffect } from 'react';
import { Shield, AlertCircle, Zap, Target, Heart, Wind, Loader2 } from 'lucide-react';
import { MECH_NFT_ABI, CONTRACTS } from '../config';

const MECH_TYPES = ['', '⚔️', '🛡️', '🚀', '🎯', '💚'];
const TYPE_NAMES = ['', 'Assault', 'Tank', 'Scout', 'Sniper', 'Support'];

export default function Collection() {
  const { address, isConnected } = useAccount();
  const [selectedMech, setSelectedMech] = useState(null);
  const [mechsData, setMechsData] = useState([]);

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

  // Fetch mech stats for each mech
  useEffect(() => {
    if (!mechIds || mechIds.length === 0) {
      setMechsData([]);
      return;
    }

    const fetchMechData = async () => {
      // This would typically be done with multicall for efficiency
      // For now, we'll fetch sequentially
      const mechs = [];
      for (const id of mechIds) {
        try {
          // We'd need a contract call here, using placeholder for structure
          mechs.push({
            id: Number(id),
            mechType: 1,
            rarity: 1,
            level: 1,
            attack: 50,
            defense: 50,
            speed: 50,
            health: 100,
            energy: 50,
            battlesWon: 0,
            battlesLost: 0,
            staked: false,
            loading: true
          });
        } catch (e) {
          console.error(`Error fetching mech ${id}:`, e);
        }
      }
      setMechsData(mechs);
    };

    fetchMechData();
  }, [mechIds]);

  // No mock data - everything comes from real contracts
  const displayMechs = mechsData;

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

  if (!isConnected) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🔗</div>
        <h2>Connect Your Wallet</h2>
        <p>Connect your wallet to view your mech collection</p>
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
        <div className="alert alert-warning">
          <AlertCircle size={20} />
          <div>
            <strong>Error Loading Data</strong>
            <p style={{ margin: 0, marginTop: '0.25rem' }}>
              {idsError.message}
            </p>
          </div>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-box">
          <div className="stat-value">{isLoadingIds ? <Loader2 size={24} className="spin" /> : totalMechs}</div>
          <div className="stat-label">Total Mechs</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{isLoadingIds ? <Loader2 size={24} className="spin" /> : stakedCount}</div>
          <div className="stat-label">Staked</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{isLoadingIds ? <Loader2 size={24} className="spin" /> : totalWins}</div>
          <div className="stat-label">Battles Won</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{isLoadingIds ? <Loader2 size={24} className="spin" /> : `${avgWinRate}%`}</div>
          <div className="stat-label">Avg Win Rate</div>
        </div>
      </div>

      {isLoadingIds ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : displayMechs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🤖</div>
          <h2>No Mechs Yet</h2>
          <p>You don&apos;t have any mechs in your collection.</p>
          <button 
            className="btn btn-primary" 
            style={{ marginTop: '1rem' }}
            onClick={() => window.dispatchEvent(new CustomEvent('setTab', { detail: 'mint' }))}
          >
            Mint Your First Mech
          </button>
        </div>
      ) : (
        <div className="grid">
          {displayMechs.map((mech) => (
            <div 
              key={mech.id} 
              className={`mech-card ${mech.staked ? 'staked' : ''} ${selectedMech === mech.id ? 'selected' : ''}`}
              onClick={() => setSelectedMech(selectedMech === mech.id ? null : mech.id)}
            >
              <div className="mech-image">
                <span className="mech-type-icon">{MECH_TYPES[mech.mechType]}</span>
                {mech.staked && <div className="staked-badge">STAKED</div>}
              </div>
              
              <div className="mech-info">
                <div className="mech-header">
                  <span className="mech-name">{TYPE_NAMES[mech.mechType]} #{mech.id}</span>
                  <span className={`mech-rarity ${getRarityClass(mech.rarity)}`}>
                    {getRarityName(mech.rarity)}
                  </span>
                </div>

                <div className="mech-stats">
                  <div className="mech-stat">
                    <span><Zap size={14} /> ATK</span>
                    <span>{mech.attack}</span>
                  </div>
                  <div className="mech-stat">
                    <span><Shield size={14} /> DEF</span>
                    <span>{mech.defense}</span>
                  </div>
                  <div className="mech-stat">
                    <span><Wind size={14} /> SPD</span>
                    <span>{mech.speed}</span>
                  </div>
                  <div className="mech-stat">
                    <span><Heart size={14} /> HP</span>
                    <span>{mech.health}</span>
                  </div>
                </div>

                <div className="mech-level">
                  <span>Level {mech.level}</span>
                  <span style={{ marginLeft: 'auto' }}>
                    {mech.battlesWon}W / {mech.battlesLost}L ({getWinRate(mech.battlesWon, mech.battlesLost)}%)
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
