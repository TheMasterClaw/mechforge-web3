import { RainbowKitProvider, ConnectButton } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from './config';
import { useState, useEffect } from 'react';
import { Swords, Shield, Coins, Sparkles, Menu, X } from 'lucide-react';
import '@rainbow-me/rainbowkit/styles.css';
import './App.css';

// Import components
import Collection from './components/Collection';
import BattleArena from './components/BattleArena';
import Staking from './components/Staking';
import Mint from './components/Mint';

// Import landing page components
import Hero from './components/Hero';
import Features from './components/Features';
import Leaderboard from './components/Leaderboard';
import CTASection from './components/CTASection';
import Footer from './components/Footer';

const queryClient = new QueryClient();

function AppContent() {
  const [activeTab, setActiveTab] = useState('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Listen for tab change events from components
  useEffect(() => {
    const handleSetTab = (e) => {
      setActiveTab(e.detail);
      // Scroll to top when changing tabs
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('setTab', handleSetTab);
    return () => window.removeEventListener('setTab', handleSetTab);
  }, []);

  const tabs = [
    { id: 'collection', label: 'Collection', icon: Shield },
    { id: 'battle', label: 'Battle Arena', icon: Swords },
    { id: 'staking', label: 'Staking', icon: Coins },
    { id: 'mint', label: 'Mint Mech', icon: Sparkles },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case 'landing':
        return (
          <>
            <Hero onEnterApp={() => { setActiveTab('collection'); setHasEntered(true); }} />
            <Features />
            <Leaderboard />
            <CTASection />
            <Footer />
          </>
        );
      case 'collection':
        return <Collection />;
      case 'battle':
        return <BattleArena />;
      case 'staking':
        return <Staking />;
      case 'mint':
        return <Mint />;
      default:
        return <Collection />;
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goHome = () => {
    setActiveTab('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isAppView = activeTab !== 'landing';

  return (
    <div className="app">
      <header className="header">
        <button 
          className="logo" 
          onClick={goHome}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          aria-label="Go to homepage"
        >
          <Swords size={32} />
          <h1>MechForge</h1>
        </button>
        
        {/* Desktop Navigation */}
        <nav className="nav desktop-nav">
          {isAppView ? (
            tabs.map((tab) => (
              <button
                key={tab.id}
                className={activeTab === tab.id ? 'active' : ''}
                onClick={() => handleTabChange(tab.id)}
              >
                <tab.icon size={18} /> {tab.label}
              </button>
            ))
          ) : (
            <>
              <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} >
                Features
              </button>
              <button onClick={() => handleTabChange('collection')}>
                Play Now
              </button>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <div className="mobile-controls">
          <ConnectButton />
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="mobile-nav">
          {isAppView ? (
            tabs.map((tab) => (
              <button
                key={tab.id}
                className={activeTab === tab.id ? 'active' : ''}
                onClick={() => handleTabChange(tab.id)}
              >
                <tab.icon size={18} /> {tab.label}
              </button>
            ))
          ) : (
            <>
              <button onClick={() => { setMobileMenuOpen(false); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }}>
                Features
              </button>
              <button onClick={() => handleTabChange('collection')}>
                Play Now
              </button>
            </>
          )}
        </nav>
      )}
      
      <main className={isAppView ? 'main-content' : ''}>
        {renderTab()}
      </main>
      
      {isAppView && (
        <footer className="footer">
          <p>MechForge - Battle, Collect, Earn on Base Sepolia</p>
          <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', opacity: 0.7 }}>
            Contracts deployed on Base Sepolia Testnet
          </p>
        </footer>
      )}
    </div>
  );
}

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <AppContent />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
