import { Swords, ChevronDown, Users, Trophy, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Hero({ onEnterApp }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero-section">
      <div className={`hero-content ${isVisible ? 'animate-fade-in-up' : ''}`}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '0.75rem',
          padding: '0.5rem 1rem',
          background: 'rgba(99, 102, 241, 0.2)',
          border: '1px solid rgba(99, 102, 241, 0.5)',
          borderRadius: '9999px',
          marginBottom: '1.5rem',
          fontSize: '0.875rem',
          color: '#c7d2fe',
          fontWeight: '500',
        }}>
          <Zap size={16} />
          <span>Powered by Base Sepolia</span>
        </div>

        <h1 className="hero-title">
          Forge Your
          <br />
          <span style={{ 
            background: 'linear-gradient(135deg, #00d4ff, #c084fc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Mech Legacy
          </span>
        </h1>

        <p className="hero-subtitle" style={{ color: '#ffffff', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 2rem', lineHeight: '1.6', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
          Mint unique mech NFTs, battle other players in intense PvP combat, 
          and earn FORGE tokens in the ultimate Web3 mech battling game.
        </p>

        <div className="hero-cta">
          <button 
            className="btn btn-primary"
            onClick={onEnterApp}
            style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}
          >
            <Swords size={20} />
            Play Now
          </button>
          
          <button 
            className="btn btn-secondary"
            onClick={() => window.dispatchEvent(new CustomEvent('setTab', { detail: 'mint' }))}
            style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}
          >
            Mint Mech
          </button>
        </div>

        <div className="hero-stats" style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginTop: '3rem', flexWrap: 'wrap' }}>
          <div className="hero-stat" style={{ textAlign: 'center' }}>
            <div className="hero-stat-value" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#00d4ff', textShadow: '0 0 20px rgba(0,212,255,0.5)' }}>10K+</div>
            <div className="hero-stat-label" style={{ color: '#e2e8f0', fontSize: '0.875rem', marginTop: '0.5rem', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Mechs Minted</div>
          </div>
          <div className="hero-stat" style={{ textAlign: 'center' }}>
            <div className="hero-stat-value" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#00d4ff', textShadow: '0 0 20px rgba(0,212,255,0.5)' }}>50K+</div>
            <div className="hero-stat-label" style={{ color: '#e2e8f0', fontSize: '0.875rem', marginTop: '0.5rem', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Battles</div>
          </div>
          <div className="hero-stat" style={{ textAlign: 'center' }}>
            <div className="hero-stat-value" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#00d4ff', textShadow: '0 0 20px rgba(0,212,255,0.5)' }}>5K+</div>
            <div className="hero-stat-label" style={{ color: '#e2e8f0', fontSize: '0.875rem', marginTop: '0.5rem', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Players</div>
          </div>
          <div className="hero-stat" style={{ textAlign: 'center' }}>
            <div className="hero-stat-value" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#00d4ff', textShadow: '0 0 20px rgba(0,212,255,0.5)' }}>125%</div>
            <div className="hero-stat-label" style={{ color: '#e2e8f0', fontSize: '0.875rem', marginTop: '0.5rem', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase' }}>APR</div>
          </div>
        </div>
      </div>

      <button 
        onClick={scrollToFeatures}
        style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '8px',
          color: '#ffffff',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          animation: 'bounce 2s infinite',
          padding: '0.75rem 1.5rem',
        }}
        aria-label="Scroll to features"
      >
        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '600' }}>
          Discover More
        </span>
        <ChevronDown size={24} />
      </button>
    </section>
  );
}
