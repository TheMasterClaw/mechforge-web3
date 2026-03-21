import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { useState } from 'react';
import { Coins, TrendingUp, Clock, Lock, Unlock, Loader2, AlertCircle } from 'lucide-react';
import { MECH_NFT_ABI, STAKING_REWARDS_ABI, FORGE_TOKEN_ABI, CONTRACTS } from '../config';
import { formatEther } from 'viem';

const MECH_TYPES = ['', '⚔️', '🛡️', '🚀', '🎯', '💚'];

export default function Staking() {
  const { address, isConnected } = useAccount();
  const [selectedStakedMech, setSelectedStakedMech] = useState(null);

  // Mock data for demo
  const stakedMechs = [
    { id: 2, mechType: 2, rarity: 3, level: 8, attack: 89, defense: 156, speed: 45, health: 312, stakedAt: Date.now() - 86400000 * 2 },
  ];
  
  const unstakedMechs = [
    { id: 1, mechType: 1, rarity: 5, level: 12, attack: 145, defense: 98, speed: 87, health: 234 },
    { id: 3, mechType: 3, rarity: 4, level: 10, attack: 102, defense: 78, speed: 156, health: 189 },
    { id: 4, mechType: 4, rarity: 2, level: 5, attack: 134, defense: 56, speed: 67, health: 145 },
    { id: 5, mechType: 5, rarity: 1, level: 3, attack: 65, defense: 89, speed: 78, health: 198 },
  ];

  const { writeContract: stake, isPending: isStaking } = useWriteContract();
  const { writeContract: unstake, isPending: isUnstaking } = useWriteContract();
  const { writeContract: claimRewards, isPending: isClaiming } = useWriteContract();

  // Mock reward calculation
  const pendingRewards = 245.5; // FORGE tokens
  const totalStaked = 1;
  const apr = 125; // 125% APR

  const handleStake = (mechId) => {
    if (!CONTRACTS.baseSepolia.StakingRewards) {
      alert('Contracts not deployed yet!');
      return;
    }
    stake({
      address: CONTRACTS.baseSepolia.StakingRewards,
      abi: STAKING_REWARDS_ABI,
      functionName: 'stake',
      args: [mechId],
    });
  };

  const handleUnstake = (mechId) => {
    if (!CONTRACTS.baseSepolia.StakingRewards) {
      alert('Contracts not deployed yet!');
      return;
    }
    unstake({
      address: CONTRACTS.baseSepolia.StakingRewards,
      abi: STAKING_REWARDS_ABI,
      functionName: 'unstake',
      args: [mechId],
    });
  };

  const handleClaim = () => {
    if (!CONTRACTS.baseSepolia.StakingRewards) {
      alert('Contracts not deployed yet!');
      return;
    }
    claimRewards({
      address: CONTRACTS.baseSepolia.StakingRewards,
      abi: STAKING_REWARDS_ABI,
      functionName: 'claimRewardsBatch',
      args: [stakedMechs.map(m => m.id)],
    });
  };

  const getRarityName = (rarity) => {
    const names = ['', 'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
    return names[rarity] || 'Unknown';
  };

  const getRarityClass = (rarity) => {
    const classes = ['', 'common', 'uncommon', 'rare', 'epic', 'legendary'];
    return classes[rarity] || 'common';
  };

  const getRarityMultiplier = (rarity) => {
    const multipliers = [0, 1, 1.25, 1.5, 2, 3];
    return multipliers[rarity] || 1;
  };

  const formatTimeStaked = (stakedAt) => {
    const days = Math.floor((Date.now() - stakedAt) / 86400000);
    if (days < 1) return '< 1 day';
    return `${days} day${days > 1 ? 's' : ''}`;
  };

  if (!isConnected) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🔗</div>
        <h2>Connect Your Wallet</h2>
        <p>Connect your wallet to stake your mechs and earn rewards</p>
      </div>
    );
  }

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-box">
          <div className="stat-value" style={{ color: 'var(--success)' }}>
            {pendingRewards.toFixed(2)}
          </div>
          <div className="stat-label">Pending FORGE</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{totalStaked}</div>
          <div className="stat-label">Mechs Staked</div>
        </div>
        <div className="stat-box">
          <div className="stat-value" style={{ color: 'var(--warning)' }}>{apr}%</div>
          <div className="stat-label">Est. APR</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">10</div>
          <div className="stat-label">FORGE / Day</div>
        </div>
      </div>

      <div className="staking-dashboard">
        {/* Staking Info Panel */}
        <div className="staking-info">
          <div className="staking-reward">
            <div className="staking-reward-value">{pendingRewards.toFixed(2)}</div>
            <div className="staking-reward-label">FORGE Tokens Available</div>
          </div>
          
          <button
            className="btn btn-success btn-full"
            onClick={handleClaim}
            disabled={pendingRewards <= 0 || isClaiming}
            style={{ marginBottom: '1rem' }}
          >
            {isClaiming ? (
              <><Loader2 size={18} className="spin" /> Claiming...</>
            ) : (
              <><Coins size={18} /> Claim Rewards</>
            )}
          </button>

          <div style={{ 
            padding: '1rem', 
            background: 'rgba(99, 102, 241, 0.1)', 
            borderRadius: '0.75rem',
            fontSize: '0.875rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <TrendingUp size={16} color="var(--success)" />
              <strong>Reward Rates</strong>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Common (1x)</span>
                <span>10/day</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Uncommon (1.25x)</span>
                <span>12.5/day</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Rare (1.5x)</span>
                <span>15/day</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Epic (2x)</span>
                <span>20/day</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Legendary (3x)</span>
                <span>30/day</span>
              </div>
            </div>
          </div>
        </div>

        {/* Staked Mechs */}
        <div>
          <h3 style={{ marginBottom: '1rem' }}>Your Staked Mechs</h3>
          
          {stakedMechs.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <Lock size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p>No mechs staked yet</p>
            </div>
          ) : (
            <div className="grid">
              {stakedMechs.map((mech) => (
                <div key={mech.id} className="mech-card staked"
                  onClick={() => setSelectedStakedMech(selectedStakedMech === mech.id ? null : mech.id)}
                >
                  <div className="mech-image">
                    <span className="mech-type-icon">{MECH_TYPES[mech.mechType]}</span>
                    <div 
                      style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        background: 'var(--success)',
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}
                    >
                      STAKED
                    </div>
                  </div>
                  
                  <div className="mech-info">
                    <div className="mech-header">
                      <span className="mech-name">Mech #{mech.id}</span>
                      <span className={`mech-rarity ${getRarityClass(mech.rarity)}`}>
                        {getRarityName(mech.rarity)}
                      </span>
                    </div>

                    <div className="mech-level">
                      <Clock size={14} />
                      <span>Staked for {formatTimeStaked(mech.stakedAt)}</span>
                    </div>

                    <div className="mech-actions">
                      <button
                        className="btn btn-danger btn-sm btn-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnstake(mech.id);
                        }}
                        disabled={isUnstaking}
                      >
                        {isUnstaking ? <Loader2 size={14} className="spin" /> : <><Unlock size={14} /> Unstake</>}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <h3 style={{ margin: '2rem 0 1rem' }}>Available to Stake</h3>
          
          <div className="grid">
            {unstakedMechs.map((mech) => (
              <div key={mech.id} className="mech-card"
                onClick={() => handleStake(mech.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="mech-image">
                  <span className="mech-type-icon">{MECH_TYPES[mech.mechType]}</span>
                </div>
                
                <div className="mech-info">
                  <div className="mech-header">
                    <span className="mech-name">Mech #{mech.id}</span>
                    <span className={`mech-rarity ${getRarityClass(mech.rarity)}`}>
                      {getRarityName(mech.rarity)}
                    </span>
                  </div>

                  <div className="mech-level">
                    <span>Level {mech.level}</span>
                    <span style={{ marginLeft: 'auto', color: 'var(--success)' }}>
                      +{(10 * getRarityMultiplier(mech.rarity)).toFixed(1)} FORGE/day
                    </span>
                  </div>

                  <div className="mech-actions">
                    <button
                      className="btn btn-success btn-sm btn-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStake(mech.id);
                      }}
                      disabled={isStaking}
                    >
                      {isStaking ? <Loader2 size={14} className="spin" /> : <><Lock size={14} /> Stake</>}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}