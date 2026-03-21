import { Swords, Twitter, MessageCircle, Github, ExternalLink } from 'lucide-react';

const footerLinks = {
  game: [
    { label: 'Collection', href: '#collection' },
    { label: 'Battle Arena', href: '#battle' },
    { label: 'Staking', href: '#staking' },
    { label: 'Mint Mech', href: '#mint' },
  ],
  resources: [
    { label: 'Documentation', href: 'https://docs.mechforge.io' },
    { label: 'Whitepaper', href: '#whitepaper' },
    { label: 'Smart Contracts', href: 'https://sepolia.basescan.org' },
    { label: 'API', href: '#api' },
  ],
  community: [
    { label: 'Discord', href: 'https://discord.gg/mechforge' },
    { label: 'Twitter', href: 'https://twitter.com/mechforge' },
    { label: 'Blog', href: '#blog' },
    { label: 'Governance', href: '#governance' },
  ],
};

export default function Footer() {
  const handleNavClick = (e, href) => {
    if (href.startsWith('#') && !href.startsWith('#http')) {
      e.preventDefault();
      const tab = href.replace('#', '');
      window.dispatchEvent(new CustomEvent('setTab', { detail: tab }));
    }
  };

  return (
    <footer className="footer-enhanced">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="footer-logo">
            <Swords size={28} />
            MechForge
          </div>
          <p className="footer-description">
            The ultimate Web3 mech battling game. Mint, battle, and earn 
            in a decentralized gaming universe powered by Base Sepolia.
          </p>
          <div className="footer-social">
            <a 
              href="https://twitter.com/mechforge" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Twitter"
            >
              <Twitter size={20} />
            </a>
            <a 
              href="https://discord.gg/mechforge" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Discord"
            >
              <MessageCircle size={20} />
            </a>
            <a 
              href="https://github.com/mechforge" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <Github size={20} />
            </a>
          </div>
        </div>

        <div className="footer-links">
          <h4>Game</h4>
          <ul>
            {footerLinks.game.map((link) => (
              <li key={link.label}>
                <a 
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-links">
          <h4>Resources</h4>
          <ul>
            {footerLinks.resources.map((link) => (
              <li key={link.label}>
                <a 
                  href={link.href}
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  {link.label}
                  {link.href.startsWith('http') && (
                    <ExternalLink size={12} style={{ marginLeft: '0.25rem', display: 'inline' }} />
                  )}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-links">
          <h4>Community</h4>
          <ul>
            {footerLinks.community.map((link) => (
              <li key={link.label}>
                <a 
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label}
                  <ExternalLink size={12} style={{ marginLeft: '0.25rem', display: 'inline' }} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} MechForge. All rights reserved. 
          Built with ❤️ on Base Sepolia.
        </p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
          Contracts deployed on Base Sepolia Testnet. 
          <a href="#" style={{ color: 'inherit', textDecoration: 'underline' }}>Terms</a>
          {' · '}
          <a href="#" style={{ color: 'inherit', textDecoration: 'underline' }}>Privacy</a>
        </p>
      </div>
    </footer>
  );
}
