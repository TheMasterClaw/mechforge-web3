import { Swords, Sparkles, ArrowRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="cta-section">
      <div className="cta-content">
        <h2 className="cta-title">Ready to Enter the Arena?</h2>
        <p className="cta-description">
          Join thousands of players in the ultimate mech battling experience. 
          Mint your first mech today and start earning FORGE rewards.
        </p>

        <div className="cta-buttons">
          <button 
            className="btn btn-primary"
            onClick={() => window.dispatchEvent(new CustomEvent('setTab', { detail: 'mint' }))}
            style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}
          >
            <Sparkles size={20} />
            Mint Your Mech
            <ArrowRight size={18} />
          </button>
          
          <button 
            className="btn btn-neon"
            onClick={() => window.dispatchEvent(new CustomEvent('setTab', { detail: 'battle' }))}
            style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}
          >
            <Swords size={20} />
            Start Battling
          </button>
        </div>

        <div style={{ 
          marginTop: '3rem',
          padding: '1.5rem',
          background: 'rgba(0, 212, 255, 0.05)',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          borderRadius: '1rem',
          display: 'inline-block',
        }}>
          <p style={{ 
            margin: 0, 
            fontSize: '0.875rem', 
            color: '#00d4ff',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <span style={{ fontSize: '1.25rem' }}>🎁</span>
            <strong>Limited Time:</strong> First 1000 minters receive a bonus Legendary Mech!
          </p>
        </div>
      </div>
    </section>
  );
}
