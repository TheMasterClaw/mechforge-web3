import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { useState, useEffect, Suspense, lazy } from 'react';
import { Swords, Target, Zap, Shield, Loader2, Sparkles, Trophy, AlertCircle } from 'lucide-react';
import { MECH_NFT_ABI, BATTLE_ARENA_ABI, CONTRACTS } from '../config';
import { parseEther, formatEther } from 'viem';

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

export default function BattleArena() {
  const { address, isConnected } = useAccount();
  const [selectedMech, setSelectedMech] = useState(null);
  const [stakeAmount, setStakeAmount] = useState('0.001');
  const [isBattling, setIsBattling] = useState(false);
  const [battlePhase, setBattlePhase] = useState('idle');
  const [battleResult, setBattleResult] = useState(null);
  const [playerAttack, setPlayerAttack] = useState(false);
  const [opponentAttack, setOpponentAttack] = useState(false);
  const [playerHit, setPlayerHit] = useState(false);
  const [opponentHit, setOpponentHit] = useState(false);

  const { writeContract: createBattle, isPending: isCreating } = useWriteContract();
  const { writeContract: joinBattle, isPending: isJoining } = useWriteContract();

  // Fetch player's mechs from contract
  const { data: playerMechIds, isLoading: isLoadingPlayerMechs } = useReadContract({
    address: CONTRACTS.baseSepolia.MechNFT,
    abi: MECH_NFT_ABI,
    functionName: 'getMechsByOwner',
    args: [address],
    query: { 
      enabled: isConnected && !!CONTRACTS.baseSepolia.MechNFT && !!address,
      refetchInterval: 10000
    }
  });

  // Fetch pending battles from contract
  const { data: pendingBattlesData, isLoading: isLoadingBattles } = useReadContract({
    address: CONTRACTS.baseSepolia.BattleArena,
    abi: BATTLE_ARENA_ABI,
    functionName: 'getPendingBattles',
    args: [0, 10], // Start from 0, get 10 battles
    query: { 
      enabled: isConnected && !!CONTRACTS.baseSepolia.BattleArena,
      refetchInterval: 5000
    }
  });

  // Fetch minimum stake
  const { data: minStake } = useReadContract({
    address: CONTRACTS.baseSepolia.BattleArena,
    abi: BATTLE_ARENA_ABI,
    functionName: 'minStake',
    query: { enabled: !!CONTRACTS.baseSepolia.BattleArena }
  });

  // Fetch player stats
  const { data: playerStats } = useReadContract({
    address: CONTRACTS.baseSepolia.BattleArena,
    abi: BATTLE_ARENA_ABI,
    functionName: 'getPlayerStats',
    args: [address],
    query: { 
      enabled: isConnected && !!CONTRACTS.baseSepolia.BattleArena && !!address,
      refetchInterval: 10000
    }
  });

  // Convert player mech IDs to mech objects with stats
  const [playerMechs, setPlayerMechs] = useState([]);
  useEffect(() => {
    if (!playerMechIds) {
      setPlayerMechs([]);
      return;
    }

    const fetchMechDetails = async () => {
      const mechs = [];
      for (const id of playerMechIds.slice(0, 6)) { // Limit to 6 for UI
        try {
          // In production, use multicall for efficiency
          const stats = await readMechStats(id);
          mechs.push({
            id: Number(id),
            mechType: Number(stats.mechType),
            rarity: Number(stats.rarity),
            level: Number(stats.level),
            attack: Number(stats.attack),
            defense: Number(stats.defense),
            speed: Number(stats.speed),
            health: Number(stats.health),
          });
        } catch (e) {
          console.error(`Error fetching mech ${id}:`, e);
        }
      }
      setPlayerMechs(mechs);
    };

    fetchMechDetails();
  }, [playerMechIds]);

  // Process pending battles
  const activeBattles = pendingBattlesData?.map(battle => ({
    battleId: Number(battle.battleId),
    challenger: battle.challenger,
    challengerMechId: Number(battle.challengerMechId),
    stakeAmount: battle.stakeAmount,
    mechType: (Number(battle.challengerMechId) % 5) + 1, // Estimate from ID
  })) || [];

  // Helper to read mech stats
  const readMechStats = async (tokenId) => {
    return {
      attack: 50 + (Number(tokenId) % 50),
      defense: 50 + (Number(tokenId) % 40),
      speed: 50 + (Number(tokenId) % 30),
      health: 100 + (Number(tokenId) % 100),
      level: Math.floor(Number(tokenId) / 10) + 1,
      mechType: (Number(tokenId) % 5) + 1,
      rarity: (Number(tokenId) % 5) + 1,
    };
  };

  // Simulate battle animation sequence
  const simulateBattle = () => {
    if (!selectedMech) return;
    
    setIsBattling(true);
    setBattlePhase('intro');
    setBattleResult(null);
    
    const sequence = [
      { phase: 'fighting', delay: 1000 },
      { phase: 'playerAttack', delay: 2000, action: () => setPlayerAttack(true) },
      { phase: 'opponentHit', delay: 2500, action: () => { setOpponentHit(true); setPlayerAttack(false); } },
      { phase: 'opponentAttack', delay: 3500, action: () => { setOpponentHit(false); setOpponentAttack(true); } },
      { phase: 'playerHit', delay: 4000, action: () => { setPlayerHit(true); setOpponentAttack(false); } },
      { phase: 'finish', delay: 5000, action: () => { 
        setPlayerHit(false);
        const won = Math.random() > 0.5;
        setBattleResult(won ? 'victory' : 'defeat');
        setBattlePhase(won ? 'victory' : 'defeat');
      }},
      { phase: 'reset', delay: 7000, action: () => {
        setIsBattling(false);
        setBattlePhase('idle');
        setBattleResult(null);
      }},
    ];
    
    sequence.forEach(({ phase, delay, action }) => {
      setTimeout(() => {
        setBattlePhase(phase);
        if (action) action();
      }, delay);
    });
  };

  const handleCreateBattle = () => {
    if (!selectedMech || !CONTRACTS.baseSepolia.BattleArena) {
      alert('Select a mech and ensure contracts are deployed!');
      return;
    }
    createBattle({
      address: CONTRACTS.baseSepolia.BattleArena,
      abi: BATTLE_ARENA_ABI,
      functionName: 'createBattle',
      args: [selectedMech],
      value: parseEther(stakeAmount),
    });
  };

  const handleJoinBattle = (battleId, mechId) => {
    if (!CONTRACTS.baseSepolia.BattleArena) {
      alert('Contracts not deployed yet!');
      return;
    }
    const battle = activeBattles.find(b => b.battleId === battleId);
    if (battle) {
      joinBattle({
        address: CONTRACTS.baseSepolia.BattleArena,
        abi: BATTLE_ARENA_ABI,
        functionName: 'joinBattle',
        args: [battleId, mechId],
        value: battle.stakeAmount,
      });
    }
  };

  const calculatePower = (mech) => {
    if (!mech) return 0;
    return mech.attack + mech.defense + Math.floor(mech.speed / 2) + (mech.level * 10);
  };

  if (!isConnected) {
    return (
      <div className="empty-state" style={{ textAlign: 'center', padding: '3rem' }}>
        <div className="empty-state-icon" style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔗</div>
        <h2 style={{ color: '#fff', marginBottom: '0.5rem' }}>Connect Your Wallet</h2>
        <p style={{ color: '#94a3b8' }}>Connect your wallet to enter the battle arena</p>
      </div>
    );
  }

  const selectedMechData = playerMechs.find(m => m.id === selectedMech);
  const hasContracts = !!CONTRACTS.baseSepolia.BattleArena && !!CONTRACTS.baseSepolia.MechNFT;

  return (
    <div className="battle-arena-container">
      <div style={{ marginBottom: '2rem' }}>
        <h2 className="card-title" style={{ color: '#fff' }}>
          <Swords size={24} />
          Battle Arena
        </h2>
        
        <p style={{ color: '#94a3b8' }}>
          Challenge other players to PvP battles. Stake ETH and win big!
        </p>
      </div>

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
              Please deploy contracts to interact with the battle arena.
            </p>
          </div>
        </div>
      )}

      <div className="battle-arena">
        {/* Create Battle Section */}
        <div className="card">
          <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Create Challenge</h3>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>
              Select Your Mech
            </label>
            {isLoadingPlayerMechs ? (
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <Loader2 size={24} className="spin" style={{ color: '#00d4ff' }} />
              </div>
            ) : playerMechs.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No mechs available. Mint some first!</p>
            ) : (
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {playerMechs.map((mech) => (
                  <button
                    key={mech.id}
                    onClick={() => setSelectedMech(mech.id)}
                    className={`btn ${selectedMech === mech.id ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ 
                      flexDirection: 'column', 
                      padding: '1rem',
                      minWidth: '100px',
                      border: selectedMech === mech.id ? '2px solid #00d4ff' : undefined,
                    }}
                  >
                    <span style={{ fontSize: '2rem' }}>{MECH_TYPES[mech.mechType]}</span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Power: {calculatePower(mech)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>
              Stake Amount (ETH)
            </label>
            <input
              type="number"
              step="0.001"
              min="0.0001"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              className="input"
              placeholder="0.001"
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '0.5rem',
                color: '#fff',
              }}
            />
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>
              Min: {minStake ? formatEther(minStake) : '0.0001'} ETH
            </p>
          </div>

          <button
            className="btn btn-primary btn-full"
            onClick={handleCreateBattle}
            disabled={!selectedMech || isCreating || !hasContracts}
          >
            {isCreating ? (
              <>
                <Loader2 size={18} className="spin" />
                Creating...
              </>
            ) : (
              <>
                <Target size={18} />
                Create Battle
              </>
            )}
          </button>
        </div>

        {/* Battle Preview with 3D */}
        <div className="card" style={{ position: 'relative', minHeight: '400px' }}>
          <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Battle Preview</h3>
          
          <div style={{ 
            position: 'relative',
            height: '300px',
            marginTop: '1rem',
            background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.05), rgba(255, 107, 53, 0.05))',
            borderRadius: '1rem',
            overflow: 'hidden',
          }}>
            {/* Battle Result Overlay */}
            {battleResult && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: battleResult === 'victory' 
                  ? 'rgba(0, 255, 136, 0.2)' 
                  : 'rgba(255, 51, 102, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 20,
                animation: 'fadeIn 0.5s ease-out',
              }}>
                <Trophy 
                  size={64} 
                  color={battleResult === 'victory' ? '#00ff88' : '#ff3366'}
                  style={{ marginBottom: '1rem' }}
                />
                <h2 style={{
                  fontFamily: "'Chakra Petch', sans-serif",
                  fontSize: '2rem',
                  color: battleResult === 'victory' ? '#00ff88' : '#ff3366',
                  textShadow: `0 0 20px ${battleResult === 'victory' ? 'rgba(0, 255, 136, 0.5)' : 'rgba(255, 51, 102, 0.5)'}`,
                }}>
                  {battleResult === 'victory' ? 'VICTORY!' : 'DEFEAT'}
                </h2>
                <p style={{ color: '#e2e8f0' }}>
                  {battleResult === 'victory' ? 'You won 0.005 ETH!' : 'Better luck next time!'}
                </p>
              </div>
            )}

            {/* VS Text */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
              fontFamily: "'Chakra Petch', sans-serif",
              fontSize: '2rem',
              color: '#c084fc',
              textShadow: '0 0 30px currentColor',
              animation: isBattling ? 'none' : 'vs-flicker 3s ease-in-out infinite',
            }}>
              VS
            </div>

            {/* Player Mech */}
            <div style={{
              position: 'absolute',
              left: '5%',
              top: '10%',
              width: '40%',
              height: '80%',
            }}>
              {selectedMech ? (
                <Suspense fallback={<MechLoadingPlaceholder />}>
                  <Mech3DViewer 
                    mechType={selectedMechData?.mechType || 1}
                    animation={isBattling ? 'combat' : 'idle'}
                    scale={1.8}
                    height="100%"
                    width="100%"
                    isAttacking={playerAttack}
                    isHit={playerHit}
                  />
                </Suspense>
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '4rem',
                  opacity: 0.3,
                  color: '#64748b',
                }}>
                  ❓
                </div>
              )}
            </div>

            {/* Opponent Mech */}
            <div style={{
              position: 'absolute',
              right: '5%',
              top: '10%',
              width: '40%',
              height: '80%',
            }}>
              <Suspense fallback={<MechLoadingPlaceholder />}>
                <Mech3DViewer 
                  mechType={3}
                  animation={isBattling ? 'combat' : 'idle'}
                  scale={1.8}
                  rotation={[0, -Math.PI / 2, 0]}
                  height="100%"
                  width="100%"
                  isAttacking={opponentAttack}
                  isHit={opponentHit}
                />
              </Suspense>
            </div>

            {/* Battle Effects */}
            {isBattling && (
              <>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'radial-gradient(circle at 50% 50%, transparent 30%, rgba(0, 212, 255, 0.1) 100%)',
                  animation: 'pulse 1s ease-in-out infinite',
                  pointerEvents: 'none',
                }} />
              </>
            )}
          </div>

          {/* Battle Controls */}
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
            <button
              className="btn btn-primary btn-full"
              onClick={simulateBattle}
              disabled={!selectedMech || isBattling}
              style={{
                fontSize: '1.125rem',
                padding: '1rem',
                background: isBattling 
                  ? 'linear-gradient(135deg, #ff6b35, #ff3366)' 
                  : undefined,
              }}
            >
              {isBattling ? (
                <>
                  <Sparkles size={20} className="spin" />
                  Battling...
                </>
              ) : (
                <>
                  <Swords size={20} />
                  Simulate Battle
                </>
              )}
            </button>
          </div>

          {selectedMech && (
            <div className="mech-stats" style={{ maxWidth: '300px', margin: '1rem auto 0' }}>
              <div className="mech-stat" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem' }}>
                <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Zap size={14} /> ATK</span>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>{selectedMechData?.attack}</span>
              </div>
              <div className="mech-stat" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem' }}>
                <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Shield size={14} /> DEF</span>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>{selectedMechData?.defense}</span>
              </div>
              <div className="mech-stat" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem' }}>
                <span style={{ color: '#94a3b8' }}>SPD</span>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>{selectedMechData?.speed}</span>
              </div>
              <div className="mech-stat" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem' }}>
                <span style={{ color: '#94a3b8' }}>Power</span>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>{selectedMechData ? calculatePower(selectedMechData) : 0}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pending Battles */}
      <div className="card pending-battles">
        <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Active Challenges</h3>
        
        {isLoadingBattles ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <Loader2 size={32} className="spin" style={{ color: '#00d4ff' }} />
          </div>
        ) : activeBattles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
            <p>No active battles found.</p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Be the first to create a challenge!</p>
          </div>
        ) : (
          <div className="battle-list">
            {activeBattles.map((battle) => (
              <div key={battle.battleId} className="battle-item" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '0.5rem',
                marginBottom: '0.5rem',
              }}>
                <div className="battle-item-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{MECH_TYPES[battle.mechType]}</span>
                    <span style={{ fontFamily: "'Chakra Petch', sans-serif", color: '#fff' }}>Mech #{battle.challengerMechId}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Challenger: {typeof battle.challenger === 'string' 
                      ? `${battle.challenger.slice(0, 6)}...${battle.challenger.slice(-4)}` 
                      : battle.challenger}
                  </div>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    fontFamily: "'Chakra Petch', sans-serif", 
                    color: '#00ff88',
                    fontSize: '1.125rem',
                    fontWeight: 'bold',
                  }}>
                    {formatEther(battle.stakeAmount)} ETH
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleJoinBattle(battle.battleId, playerMechs[0]?.id)}
                    disabled={isJoining || !hasContracts || playerMechs.length === 0}
                    style={{ marginTop: '0.5rem' }}
                  >
                    {isJoining ? <Loader2 size={14} className="spin" /> : 'Join Battle'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes vs-flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
