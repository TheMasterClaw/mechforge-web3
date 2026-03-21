import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { useState, useEffect } from 'react';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { MECH_NFT_ABI, CONTRACTS } from '../config';

const MECH_TYPES = ['🤖', '⚔️', '🛡️', '🚀', '⚡', '🔥'];

export default function Mint() {
  const { address, isConnected } = useAccount();
  const [quantity, setQuantity] = useState(1);
  const [mintedMechs, setMintedMechs] = useState([]);

  const MINT_PRICE = parseEther('0.001');
  const totalPrice = MINT_PRICE * BigInt(quantity);

  const { data: mintPrice } = useReadContract({
    address: CONTRACTS.baseSepolia.MechNFT,
    abi: MECH_NFT_ABI,
    functionName: 'MINT_PRICE',
    query: { enabled: !!CONTRACTS.baseSepolia.MechNFT }
  });

  const { 
    writeContract: mint, 
    data: hash,
    isPending: isMinting,
    error: mintError 
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isSuccess) {
      // Simulate getting a new mech
      const newMech = {
        id: Math.floor(Math.random() * 10000),
        type: Math.floor(Math.random() * 5) + 1,
        rarity: Math.floor(Math.random() * 5) + 1,
        stats: {
          attack: 50 + Math.floor(Math.random() * 50),
          defense: 50 + Math.floor(Math.random() * 50),
          speed: 50 + Math.floor(Math.random() * 50),
          health: 100 + Math.floor(Math.random() * 100),
          level: 1
        }
      };
      setMintedMechs(prev => [newMech, ...prev].slice(0, 5));
    }
  }, [isSuccess]);

  const handleMint = () => {
    if (!CONTRACTS.baseSepolia.MechNFT) {
      alert('Contracts not deployed yet!');
      return;
    }
    mint({
      address: CONTRACTS.baseSepolia.MechNFT,
      abi: MECH_NFT_ABI,
      functionName: 'mint',
      args: [quantity],
      value: totalPrice,
    });
  };

  const getRarityName = (rarity) => {
    const names = ['', 'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
    return names[rarity] || 'Unknown';
  };

  const getRarityClass = (rarity) => {
    const classes = ['', 'common', 'uncommon', 'rare', 'epic', 'legendary'];
    return classes[rarity] || 'common';
  };

  if (!isConnected) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🔗</div>
        <h2>Connect Your Wallet</h2>
        <p>Connect your wallet to mint new mechs</p>
      </div>
    );
  }

  if (!CONTRACTS.baseSepolia.MechNFT) {
    return (
      <div className="alert alert-warning">
        <AlertCircle size={20} />
        <div>
          <strong>Contracts Not Deployed</strong>
          <p style={{ margin: 0, marginTop: '0.25rem' }}>
            The smart contracts need to be deployed to Base Sepolia first. Run the deployment script to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mint-container">
      <h2 className="card-title">
        <Sparkles size={24} />
        Mint New Mech
      </h2>
      
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Mint unique mech NFTs with random stats and rarities. Each mech is one-of-a-kind!
      </p>

      <div className="mint-preview">
        {MECH_TYPES[Math.floor(Math.random() * MECH_TYPES.length)]}
      </div>

      <div className="mint-price">
        Price: <span>{formatEther(mintPrice || MINT_PRICE)} ETH</span> per mech
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
          Quantity
        </label>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              onClick={() => setQuantity(num)}
              className={`btn ${quantity === num ? 'btn-primary' : 'btn-secondary'}`}
              style={{ minWidth: '50px' }}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>
        Total: <span style={{ color: 'var(--success)', fontWeight: 700 }}>
          {formatEther(totalPrice)} ETH
        </span>
      </div>

      <button
        className="btn btn-primary btn-full"
        onClick={handleMint}
        disabled={isMinting || isConfirming}
        style={{ maxWidth: '300px', margin: '0 auto', display: 'flex' }}
      >
        {isMinting || isConfirming ? (
          <>
            <Loader2 size={18} className="spin" />
            {isMinting ? 'Confirming...' : 'Processing...'}
          </>
        ) : (
          <>
            <Sparkles size={18} />
            Mint {quantity} Mech{quantity > 1 ? 's' : ''}
          </>
        )}
      </button>

      {mintError && (
        <div className="alert alert-warning" style={{ marginTop: '1rem' }}>
          <AlertCircle size={18} />
          {mintError.message}
        </div>
      )}

      {isSuccess && (
        <div className="alert alert-success" style={{ marginTop: '1rem' }}>
          🎉 Successfully minted {quantity} mech{quantity > 1 ? 's' : ''}!
        </div>
      )}

      {/* Recently Minted */}
      {mintedMechs.length > 0 && (
        <div style={{ marginTop: '3rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Recently Minted</h3>
          <div className="grid" style={{ maxWidth: '600px', margin: '0 auto' }}>
            {mintedMechs.map((mech, idx) => (
              <div key={idx} className="mech-card" style={{ maxWidth: '200px', margin: '0 auto' }}>
                <div className="mech-image" style={{ fontSize: '3rem' }}>
                  {MECH_TYPES[mech.type]}
                </div>
                <div className="mech-info">
                  <div className="mech-header">
                    <span className="mech-name">Mech #{mech.id}</span>
                    <span className={`mech-rarity ${getRarityClass(mech.rarity)}`}>
                      {getRarityName(mech.rarity)}
                    </span>
                  </div>
                  <div className="mech-stats" style={{ fontSize: '0.75rem' }}>
                    <div className="mech-stat">
                      <span>ATK</span>
                      <span>{mech.stats.attack}</span>
                    </div>
                    <div className="mech-stat">
                      <span>DEF</span>
                      <span>{mech.stats.defense}</span>
                    </div>
                    <div className="mech-stat">
                      <span>SPD</span>
                      <span>{mech.stats.speed}</span>
                    </div>
                    <div className="mech-stat">
                      <span>HP</span>
                      <span>{mech.stats.health}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}