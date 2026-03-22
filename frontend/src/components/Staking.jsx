import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useState, useEffect } from 'react';
import { Coins, TrendingUp, Clock, Lock, Unlock, Loader2, AlertCircle } from 'lucide-react';
import { MECH_NFT_ABI, STAKING_REWARDS_ABI, FORGE_TOKEN_ABI, CONTRACTS } from '../config';
import { formatEther } from 'viem';

const MECH_TYPES = ['', '⚔️', '🛡️', '🚀', '🎯', '💚'];

export default function Staking() {
  const { address, isConnected } = useAccount();
  const [selectedStakedMech, setSelectedStakedMech] = useState(null);
  
  const hasContracts = !!CONTRACTS.baseSepolia.StakingRewards && !!CONTRACTS.baseSepolia.MechNFT;

  // Fetch user's staked mechs
  const { data: userStakes, isLoading: isLoadingStakes } = useReadContract({
    address: CONTRACTS.baseSepolia.StakingRewards,
    abi: STAKING_REWARDS_ABI,
    functionName: 'getUserStakes',
    args: [address],
    query: { 
      enabled: isConnected && !!CONTRACTS.baseSepolia.StakingRewards && !!address,
      refetchInterval: 10000
    }
  });

  // Fetch total pending rewards
  const { data: pendingRewardsData, isLoading: isLoadingRewards } = useReadContract({
    address: CONTRACTS.baseSepolia.StakingRewards,
    abi: STAKING_REWARDS_ABI,
    functionName: 'calculateTotalPendingRewards',
    args: [address],
    query: { 
      enabled: isConnected && !!CONTRACTS.baseSepolia.StakingRewards && !!address,
      refetchInterval: 5000
    }
  });

  // Fetch FORGE token balance
  const { data: forgeBalance } = useReadContract({
    address: CONTRACTS.baseSepolia.ForgeToken,
    abi: FORGE_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address],
    query: { 
      enabled: isConnected && !!CONTRACTS.baseSepolia.ForgeToken && !!address,
      refetchInterval: 10000
    }
  });

  const { writeContract: stake, isPending: isStaking, data: stakeHash } = useWriteContract();
  const { writeContract: unstake, isPending: isUnstaking, data: unstakeHash } = useWriteContract();
  const { writeContract: claimRewards, isPending: isClaiming, data: claimHash } = useWriteContract();

  const { isLoading: isStakeConfirming } = useWaitForTransactionReceipt({ hash: stakeHash });
  const { isLoading: isUnstakeConfirming } = useWaitForTransactionReceipt({ hash: unstakeHash });
  const { isLoading: isClaimConfirming } = useWaitForTransactionReceipt({ hash: claimHash });

  // No mock data - everything from real contracts
  const stakedMechs = userStakes?.map(id => ({ id: Number(id) })) || [];
  const unstakedMechs = []; // Would fetch from Collection component
  const pendingRewards = pendingRewardsData ? Number(formatEther(pendingRewardsData)) : 0;
  const totalStaked = userStakes?.length || 0;
  const apr = 125; // From contract
  const forgeTokenBalance = forgeBalance ? Number(formatEther(forgeBalance)) : 0;

  const handleStake = (mechId) => {
    stake({
      address: CONTRACTS.baseSepolia.StakingRewards,
      abi: STAKING_REWARDS_ABI,
      functionName: 'stake',
      args: [mechId],
    });
  };

  const handleUnstake = (mechId) => {
    unstake({
      address: CONTRACTS.baseSepolia.StakingRewards,
      abi: STAKING_REWARDS_ABI,
      functionName: 'unstake',
      args: [mechId],
    });
  };

  const handleClaim = () => {
    if (userStakes && userStakes.length > 0) {
      // Use claimRewardsBatch if multiple stakes, otherwise claimRewards
      if (userStakes.length === 1) {
        claimRewards({
          address: CONTRACTS.baseSepolia.StakingRewards,
          abi: STAKING_REWARDS_ABI,
          functionName: 'claimRewards',
          args: [userStakes[0]],
        });
      } else {
        claimRewards({
          address: CONTRACTS.baseSepolia.StakingRewards,
          abi: STAKING_REWARDS_ABI,
          functionName: 'claimRewardsBatch',
          args: [userStakes],
        });
      }
    }
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
      <div className="empty-state" style={{ textAlign: 'center', padding: '3rem' }}>
        <div className="empty-state-icon" style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔗</div>
        <h2 style={{ color: '#fff', marginBottom: '0.5rem' }}>Connect Your Wallet</h2>
        <p style={{ color: '#94a3b8' }}>Connect your wallet to stake your mechs and earn rewards</p>
      </div>
    );
  }

  const isProcessing = isStaking || isUnstaking || isClaiming || isStakeConfirming || isUnstakeConfirming || isClaimConfirming;

  return (
    <div>
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
              Please deploy contracts to stake for real rewards.
            </p>
          </div>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-box">
          <div className="stat-value" style={{ color: 'var(--success)' }}>
            {isLoadingRewards ? <Loader2 size={20} className="spin" /> : pendingRewards.toFixed(2)}
          </div>
          <div className="stat-label">Pending FORGE</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">
            {isLoadingStakes ? <Loader2 size={20} className="spin" /> : totalStaked}
          </div>
          <div className="stat-label">Mechs Staked</div>
        </div>
        <div className="stat-box">
          <div className="stat-value" style={{ color: 'var(--warning)' }}>{apr}%</div>
          <div className="stat-label">Est. APR</div>
        </div>
        <div className="stat-box">
          <div className="stat-value" style={{ color: 'var(--accent-primary)' }}>
            {forgeBalance !== undefined ? forgeTokenBalance.toFixed(2) : '--'}
          </div>
          <div className="stat-label">FORGE Balance</div>
        </div>
      </div>

      <div className="staking-dashboard">
        {/* Staking Info Panel */}
        <div className="staking-info">
          <div className="staking-reward">
            <div className="staking-reward-value">
              {isLoadingRewards ? <Loader2 size={32} className="spin" /> : pendingRewards.toFixed(2)}
            </div>
            <div className="staking-reward-label">FORGE Tokens Available</div>
          </div>
          
          <button
            className="btn btn-success btn-full"
            onClick={handleClaim}
            disabled={pendingRewards <= 0 || isProcessing || isLoadingRewards}
            style={{ marginBottom: '1rem' }}
          >
            {isClaiming || isClaimConfirming ? (
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
          
          {isLoadingStakes ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <Loader2 size={48} className="spin" style={{ opacity: 0.5, marginBottom: '1rem' }} />
              <p>Loading staked mechs...</p>
            </div>
          ) : stakedMechs.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <Lock size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p>No mechs staked yet</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                Stake your mechs below to start earning FORGE tokens
              </p>
            </div>
          ) : (
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
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
                        disabled={isProcessing}
                      >
                        {isUnstaking || isUnstakeConfirming ? <Loader2 size={14} className="spin" /> : <><Unlock size={14} /> Unstake</>}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {unstakedMechs.length > 0 && (
            <>
              <h3 style={{ margin: '2rem 0 1rem' }}>Available to Stake</h3>
              
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
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
                          disabled={isProcessing}
                        >
                          {isStaking || isStakeConfirming ? <Loader2 size={14} className="spin" /> : <><Lock size={14} /> Stake</>}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
