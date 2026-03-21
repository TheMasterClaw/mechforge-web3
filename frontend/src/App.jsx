import { RainbowKitProvider, ConnectButton } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from './config';
import { useState, useEffect } from 'react';
import { Swords, Shield, Coins, Sparkles, Menu, X } from 'lucide-react';
import '@rainbow-me/rainbowkit/styles.css';
import './App.css';

import Collection from './components/Collection';
import BattleArena from './components/BattleArena';
import Staking from './components/Staking';
import Mint from './components/Mint';

const queryClient = new QueryClient();

function AppContent() {
  const [activeTab, setActiveTab] = useState('collection');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
  };

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <Swords size={32} />
          <h1>MechForge</h1>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="nav desktop-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={activeTab === tab.id ? 'active' : ''}
              onClick={() => handleTabChange(tab.id)}
            >
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <div className="mobile-controls">
          <ConnectButton />
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="mobile-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={activeTab === tab.id ? 'active' : ''}
              onClick={() => handleTabChange(tab.id)}
            >
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </nav>
      )}
      
      <main className="main-content">
        {renderTab()}
      </main>
      
      <footer className="footer">
        <p>MechForge - Battle, Collect, Earn on Base Sepolia</p>
        <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', opacity: 0.7 }}>
          Contracts deployed on Base Sepolia Testnet
        </p>
      </footer>
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
