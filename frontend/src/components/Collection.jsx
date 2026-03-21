import { useAccount, useReadContract } from 'wagmi';
import { useState } from 'react';
import { Shield, AlertCircle, Zap, Target, Heart, Wind } from 'lucide-react';
import { MECH_NFT_ABI, CONTRACTS } from '../config';

const MECH_TYPES = ['', '⚔️', '🛡️', '🚀', '🎯', '💚'];
const TYPE_NAMES = ['', 'Assault', 'Tank', 'Scout', 'Sniper', 'Support'];

export default function Collection() {
  const { address, isConnected } = useAccount();
  const [selectedMech, setSelectedMech] = useState(null);

  const { data: mechIds, isLoading } = useReadContract({
    address: CONTRACTS.baseSepolia.MechNFT,
    abi: MECH_NFT_ABI,
    functionName: 'getMechsByOwner',
    args: [address],
    query: { 
      enabled: isConnected && !!CONTRACTS.baseSepolia.MechNFT,
      refetchInterval: 5000
    }
  });

  // Mock data for when contracts aren't deployed
  const mockMechs = [
    { id: 1, mechType: 1, rarity: 5, level: 12, attack: 145, defense: 98, speed: 87, health: 234, energy: 120, battlesWon: 15, battlesLost: 3, staked: false },
    { id: 2, mechType: 2, rarity: 3, level: 8, attack: 89, defense: 156, speed: 45, health: 312, energy: 95, battlesWon: 8, battlesLost: 5, staked: true },
    { id: 3, mechType: 3, rarity: 4, level: 10, attack: 102, defense: 78, speed: 156, health: 189, energy: 145, battlesWon: 12, battlesLost: 4, staked: false },
    { id: 4, mechType: 4, rarity: 2, level: 5, attack: 134, defense: 56, speed: 67, health: 145, energy: 110, battlesWon: 4, battlesLost: 6, staked: false },
    { id: 5, mechType: 5, rarity: 1, level: 3, attack: 65, defense: 89, speed: 78, health: 198, energy: 156, battlesWon: 2, battlesLost: 3, staked: false },
  ];

  const displayMechs = mechIds && CONTRACTS.baseSepolia.MechNFT 
    ? [] // Would fetch individual mech data
    : mockMechs;

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

  if (isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!CONTRACTS.baseSepolia.MechNFT) {
    return (
      <>
        <div className="alert alert-info">
          <AlertCircle size={20} />
          <div>
            <strong>Demo Mode</strong>
            <p style={{ margin: 0, marginTop: '0.25rem' }}>
              Contracts not deployed yet. Showing example mechs. Deploy contracts to see your real collection.
            </p>
          </div>
        </div>
        <div className="stats-grid">
          <div className="stat-box">
            <div className="stat-value">{displayMechs.length}</div>
            <div className="stat-label">Total Mechs</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{displayMechs.filter(m => m.staked).length}</div>
            <div className="stat-label">Staked</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{displayMechs.reduce((acc, m) => acc + m.battlesWon, 0)}</div>
            <div className="stat-label">Battles Won</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">
              {Math.round(displayMechs.reduce((acc, m) => acc + getWinRate(m.battlesWon, m.battlesLost), 0) / displayMechs.length)}%
            </div>
            <div className="stat-label">Avg Win Rate</div>
          </div>
        </div>

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
      </>
    );
  }

  return (
    <>
      <div className="stats-grid">
        <div className="stat-box">
          <div className="stat-value">{mechIds?.length || 0}</div>
          <div className="stat-label">Total Mechs</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">0</div>
          <div className="stat-label">Staked</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">0</div>
          <div className="stat-label">Battles Won</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">0%</div>
          <div className="stat-label">Win Rate</div>
        </div>
      </div>

      {(!mechIds || mechIds.length === 0) ? (
        <div className="empty-state">
          <div className="empty-state-icon">🤖</div>
          <h2>No Mechs Yet</h2>
          <p>Visit the Mint tab to get your first mech!</p>
        </div>
      ) : (
        <div className="grid">
          {/* Would render real mechs here */}
        </div>
      )}
    </>
  );
}