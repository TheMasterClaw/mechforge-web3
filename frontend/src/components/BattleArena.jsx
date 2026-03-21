import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { useState, useEffect, Suspense, lazy } from 'react';
import { Swords, Target, Zap, Shield, Loader2, Sparkles, Trophy } from 'lucide-react';
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
  const [battlePhase, setBattlePhase] = useState('idle'); // idle, intro, fighting, victory, defeat
  const [battleResult, setBattleResult] = useState(null);
  const [playerAttack, setPlayerAttack] = useState(false);
  const [opponentAttack, setOpponentAttack] = useState(false);
  const [playerHit, setPlayerHit] = useState(false);
  const [opponentHit, setOpponentHit] = useState(false);

  const [activeBattles, setActiveBattles] = useState([
    { battleId: 1, challenger: '0x1234...5678', challengerMechId: 42, stakeAmount: parseEther('0.005'), mechType: 1 },
    { battleId: 2, challenger: '0xabcd...efgh', challengerMechId: 17, stakeAmount: parseEther('0.01'), mechType: 3 },
    { battleId: 3, challenger: '0x9876...5432', challengerMechId: 89, stakeAmount: parseEther('0.002'), mechType: 2 },
  ]);

  const { writeContract: createBattle, isPending: isCreating } = useWriteContract();
  const { writeContract: joinBattle, isPending: isJoining } = useWriteContract();

  const { data: minStake } = useReadContract({
    address: CONTRACTS.baseSepolia.BattleArena,
    abi: BATTLE_ARENA_ABI,
    functionName: 'minStake',
    query: { enabled: !!CONTRACTS.baseSepolia.BattleArena }
  });

  // Mock player mechs
  const playerMechs = [
    { id: 1, mechType: 1, rarity: 5, level: 12, attack: 145, defense: 98, speed: 87, health: 234 },
    { id: 3, mechType: 3, rarity: 4, level: 10, attack: 102, defense: 78, speed: 156, health: 189 },
    { id: 4, mechType: 4, rarity: 2, level: 5, attack: 134, defense: 56, speed: 67, health: 145 },
  ];

  // Simulate battle animation sequence
  const simulateBattle = () => {
    if (!selectedMech) return;
    
    setIsBattling(true);
    setBattlePhase('intro');
    setBattleResult(null);
    
    // Battle sequence timing
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
    return mech.attack + mech.defense + Math.floor(mech.speed / 2) + (mech.level * 10);
  };

  if (!isConnected) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🔗</div>
        <h2>Connect Your Wallet</h2>
        <p>Connect your wallet to enter the battle arena</p>
      </div>
    );
  }

  const selectedMechData = playerMechs.find(m => m.id === selectedMech);

  return (
    <div className="battle-arena-container">
      <div style={{ marginBottom: '2rem' }}>
        <h2 className="card-title">
          <Swords size={24} />
          Battle Arena
        </h2>
        
        <p style={{ color: 'var(--text-secondary)' }}>
          Challenge other players to PvP battles. Stake ETH and win big!
        </p>
      </div>

      <div className="battle-arena">
        {/* Create Battle Section */}
        <div className="card">
          <h3>Create Challenge</h3>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              Select Your Mech
            </label>
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
                  <span style={{ fontSize: '0.75rem' }}>Power: {calculatePower(mech)}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
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
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Min: {minStake ? formatEther(minStake) : '0.0001'} ETH
            </p>
          </div>

          <button
            className="btn btn-primary btn-full"
            onClick={handleCreateBattle}
            disabled={!selectedMech || isCreating}
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
          <h3>Battle Preview</h3>
          
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
                  fontFamily: 'Russo One, sans-serif',
                  fontSize: '2rem',
                  color: battleResult === 'victory' ? '#00ff88' : '#ff3366',
                  textShadow: `0 0 20px ${battleResult === 'victory' ? 'rgba(0, 255, 136, 0.5)' : 'rgba(255, 51, 102, 0.5)'}`,
                }}>
                  {battleResult === 'victory' ? 'VICTORY!' : 'DEFEAT'}
                </h2>
                <p style={{ color: 'var(--text-secondary)' }}>
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
              fontFamily: 'Russo One, sans-serif',
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
              <div className="mech-stat">
                <span><Zap size={14} /> ATK</span>
                <span>{selectedMechData?.attack}</span>
              </div>
              <div className="mech-stat">
                <span><Shield size={14} /> DEF</span>
                <span>{selectedMechData?.defense}</span>
              </div>
              <div className="mech-stat">
                <span>SPD</span>
                <span>{selectedMechData?.speed}</span>
              </div>
              <div className="mech-stat">
                <span>Power</span>
                <span>{selectedMechData ? calculatePower(selectedMechData) : 0}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pending Battles */}
      <div className="card pending-battles">
        <h3>Active Challenges</h3>
        
        <div className="battle-list">
          {activeBattles.map((battle) => (
            <div key={battle.battleId} className="battle-item">
              <div className="battle-item-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{MECH_TYPES[battle.mechType]}</span>
                  <span style={{ fontFamily: 'Russo One, sans-serif' }}>Mech #{battle.challengerMechId}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Challenger: {battle.challenger}
                </div>
              </div>
              
              <div style={{ textAlign: 'right' }}>
                <div className="battle-item-stake">
                  {formatEther(battle.stakeAmount)} ETH
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleJoinBattle(battle.battleId, playerMechs[0].id)}
                  disabled={isJoining}
                >
                  {isJoining ? <Loader2 size={14} className="spin" /> : 'Join Battle'}
                </button>
              </div>
            </div>
          ))}
        </div>
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
