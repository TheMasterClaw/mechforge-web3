import { RainbowKitProvider, ConnectButton } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from './config';
import { useState } from 'react';
import { Swords, Shield, Coins, Sparkles } from 'lucide-react';
import '@rainbow-me/rainbowkit/styles.css';
import './App.css';

import Collection from './components/Collection';
import BattleArena from './components/BattleArena';
import Staking from './components/Staking';
import Mint from './components/Mint';

const queryClient = new QueryClient();

function AppContent() {
  const [activeTab, setActiveTab] = useState('collection');

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

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <Swords size={32} />
          <h1>MechForge</h1>
        </div>
        <nav className="nav">
          <button
            className={activeTab === 'collection' ? 'active' : ''}
            onClick={() => setActiveTab('collection')}
          >
            <Shield size={18} /> Collection
          </button>
          <button
            className={activeTab === 'battle' ? 'active' : ''}
            onClick={() => setActiveTab('battle')}
          >
            <Swords size={18} /> Battle Arena
          </button>
          <button
            className={activeTab === 'staking' ? 'active' : ''}
            onClick={() => setActiveTab('staking')}
          >
            <Coins size={18} /> Staking
          </button>
          <button
            className={activeTab === 'mint' ? 'active' : ''}
            onClick={() => setActiveTab('mint')}
          >
            <Sparkles size={18} /> Mint Mech
          </button>
        </nav>
        <ConnectButton />
      </header>
      
      <main className="main-content">
        {renderTab()}
      </main>
      
      <footer className="footer">
        <p>MechForge - Battle, Collect, Earn on Base Sepolia</p>
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