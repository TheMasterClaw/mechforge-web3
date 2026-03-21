import { Trophy, TrendingUp, Medal } from 'lucide-react';

const leaderboardData = [
  { rank: 1, name: 'CyberWolf', wins: 1567, earnings: '45.2 ETH', avatar: 'CW' },
  { rank: 2, name: 'NeonNinja', wins: 1423, earnings: '38.7 ETH', avatar: 'NN' },
  { rank: 3, name: 'MechMaster', wins: 1298, earnings: '32.1 ETH', avatar: 'MM' },
  { rank: 4, name: 'PixelPilot', wins: 1156, earnings: '28.5 ETH', avatar: 'PP' },
  { rank: 5, name: 'ForgeKing', wins: 1089, earnings: '25.3 ETH', avatar: 'FK' },
];

export default function Leaderboard() {
  return (
    <section className="leaderboard-section">
      <div className="section-header">
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '0.75rem',
          marginBottom: '1rem',
        }}>
          <Trophy size={32} color="#fbbf24" />
        </div>
        <h2 className="section-title">Top Pilots</h2>
        <p className="section-subtitle">
          The most skilled mech pilots in the arena. Battle your way to the top 
          and claim your spot on the leaderboard.
        </p>
      </div>

      <div className="leaderboard-container">
        <div className="leaderboard-card">
          <div className="leaderboard-header">
            <span>#</span>
            <span>Pilot</span>
            <span>Wins</span>
            <span>Earnings</span>
          </div>

          {leaderboardData.map((player) => (
            <div key={player.rank} className="leaderboard-row">
              <div className={`leaderboard-rank ${player.rank <= 3 ? 'top-3' : ''}`}>
                {player.rank === 1 && <Medal size={20} style={{ color: '#fbbf24' }} />}
                {player.rank === 2 && <Medal size={20} style={{ color: '#94a3b8' }} />}
                {player.rank === 3 && <Medal size={20} style={{ color: '#cd7f32' }} />}
                {player.rank > 3 && player.rank}
              </div>

              <div className="leaderboard-player">
                <div className="leaderboard-avatar">{player.avatar}</div>
                <span className="leaderboard-name">{player.name}</span>
              </div>

              <div className="leaderboard-wins">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={16} />
                  {player.wins.toLocaleString()}
                </span>
              </div>

              <div className="leaderboard-earnings">
                {player.earnings}
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button 
            className="btn btn-secondary"
            onClick={() => window.dispatchEvent(new CustomEvent('setTab', { detail: 'battle' }))}
          >
            View Full Leaderboard
          </button>
        </div>
      </div>
    </section>
  );
}
