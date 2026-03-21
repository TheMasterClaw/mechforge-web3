import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { useState } from 'react';
import { Swords, Target, Zap, Shield, Loader2 } from 'lucide-react';
import { MECH_NFT_ABI, BATTLE_ARENA_ABI, CONTRACTS } from '../config';
import { parseEther, formatEther } from 'viem';

const MECH_TYPES = ['', '⚔️', '🛡️', '🚀', '🎯', '💚'];

export default function BattleArena() {
  const { address, isConnected } = useAccount();
  const [selectedMech, setSelectedMech] = useState(null);
  const [stakeAmount, setStakeAmount] = useState('0.001');
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
                  style={{ flexDirection: 'column', padding: '1rem' }}
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

        {/* Battle Preview */}
        <div className="card">
          <h3>Battle Preview</h3>
          
          <div className="battle-vs" style={{ margin: '2rem 0' }}>
            <div 
              className={`battle-mech ${selectedMech ? 'selected' : ''}`}
              style={{ fontSize: '4rem' }}
            >
              {selectedMech ? MECH_TYPES[playerMechs.find(m => m.id === selectedMech)?.mechType || 1] : '?'}
            </div>
            
            <span className="vs-text">VS</span>
            
            <div className="battle-mech">
              ❓
            </div>
          </div>

          {selectedMech && (
            <div className="mech-stats" style={{ maxWidth: '200px', margin: '0 auto' }}>
              {(() => {
                const mech = playerMechs.find(m => m.id === selectedMech);
                return mech ? (
                  <>
                    <div className="mech-stat">
                      <span><Zap size={14} /> ATK</span>
                      <span>{mech.attack}</span>
                    </div>
                    <div className="mech-stat">
                      <span><Shield size={14} /> DEF</span>
                      <span>{mech.defense}</span>
                    </div>
                    <div className="mech-stat">
                      <span>SPD</span>
                      <span>{mech.speed}</span>
                    </div>
                    <div className="mech-stat">
                      <span>Power</span>
                      <span>{calculatePower(mech)}</span>
                    </div>
                  </>
                ) : null;
              })()}
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
                  <span>Mech #{battle.challengerMechId}</span>
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
    </div>
  );
}