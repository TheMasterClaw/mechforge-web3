import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { useState } from 'react';
import { Sparkles, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { MECH_NFT_ABI, CONTRACTS } from '../config';

const MECH_TYPES = ['🤖', '⚔️', '🛡️', '🚀', '⚡', '🔥'];

export default function Mint() {
  const { address, isConnected } = useAccount();
  const [quantity, setQuantity] = useState(1);
  const [mintSuccess, setMintSuccess] = useState(false);

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
    error: mintError,
    reset: resetMint
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Clear success message after 5 seconds
  useState(() => {
    if (isSuccess) {
      setMintSuccess(true);
      const timer = setTimeout(() => {
        setMintSuccess(false);
        resetMint();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, resetMint]);

  const handleMint = () => {
    if (!CONTRACTS.baseSepolia.MechNFT) {
      alert('Contracts not deployed yet!');
      return;
    }
    setMintSuccess(false);
    mint({
      address: CONTRACTS.baseSepolia.MechNFT,
      abi: MECH_NFT_ABI,
      functionName: 'mint',
      args: [quantity],
      value: totalPrice,
    });
  };

  const hasContracts = !!CONTRACTS.baseSepolia.MechNFT;

  if (!isConnected) {
    return (
      <div className="empty-state" style={{ textAlign: 'center', padding: '3rem' }}>
        <div className="empty-state-icon" style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔗</div>
        <h2 style={{ color: '#fff', marginBottom: '0.5rem' }}>Connect Your Wallet</h2>
        <p style={{ color: '#94a3b8' }}>Connect your wallet to mint new mechs</p>
      </div>
    );
  }

  if (!hasContracts) {
    return (
      <div className="alert alert-warning" style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '1rem',
        background: 'rgba(255, 193, 7, 0.15)',
        border: '1px solid rgba(255, 193, 7, 0.4)',
        borderRadius: '0.5rem',
        color: '#fbbf24',
      }}>
        <AlertCircle size={20} />
        <div>
          <strong>Contracts Not Deployed</strong>
          <p style={{ margin: 0, marginTop: '0.25rem', color: '#fcd34d' }}>
            The smart contracts need to be deployed to Base Sepolia first. Run the deployment script to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mint-container" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
      <h2 className="card-title" style={{ color: '#fff', justifyContent: 'center' }}>
        <Sparkles size={24} />
        Mint New Mech
      </h2>
      
      <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
        Mint unique mech NFTs with random stats and rarities. Each mech is one-of-a-kind!
      </p>

      <div className="mint-preview" style={{
        width: '250px',
        height: '250px',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))',
        border: '2px solid rgba(99, 102, 241, 0.5)',
        borderRadius: '1rem',
        margin: '2rem auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '6rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 0 40px rgba(99, 102, 241, 0.3)',
      }}>
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'linear-gradient(45deg, transparent 30%, rgba(99, 102, 241, 0.1) 50%, transparent 70%)',
          animation: 'shimmer 3s infinite',
        }} />
        {MECH_TYPES[Math.floor(Math.random() * MECH_TYPES.length)]}
      </div>

      <div style={{ 
        fontSize: '1.25rem', 
        margin: '1.5rem 0',
        color: '#e2e8f0'
      }}>
        Price: <span style={{ color: '#00ff88', fontWeight: 'bold', fontSize: '1.5rem' }}>
          {formatEther(mintPrice || MINT_PRICE)} ETH
        </span> per mech
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.75rem', color: '#94a3b8' }}>
          Quantity
        </label>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              onClick={() => setQuantity(num)}
              className={`btn ${quantity === num ? 'btn-primary' : 'btn-secondary'}`}
              style={{ 
                minWidth: '50px',
                background: quantity === num 
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' 
                  : 'rgba(255,255,255,0.05)',
                color: quantity === num ? '#fff' : '#94a3b8',
              }}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>
        Total: <span style={{ color: '#00ff88', fontWeight: 700, fontSize: '1.5rem' }}>
          {formatEther(totalPrice)} ETH
        </span>
      </div>

      <button
        className="btn btn-primary btn-full"
        onClick={handleMint}
        disabled={isMinting || isConfirming}
        style={{ 
          maxWidth: '300px', 
          margin: '0 auto', 
          display: 'flex',
          fontSize: '1.125rem',
          padding: '1rem 2rem',
        }}
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
        <div className="alert alert-warning" style={{ 
          marginTop: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1rem',
          background: 'rgba(255, 51, 102, 0.15)',
          border: '1px solid rgba(255, 51, 102, 0.3)',
          borderRadius: '0.5rem',
          color: '#ff6b6b',
        }}>
          <AlertCircle size={18} />
          <span>{mintError.message}</span>
        </div>
      )}

      {(isSuccess || mintSuccess) && (
        <div style={{ 
          marginTop: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          padding: '1rem',
          background: 'rgba(0, 255, 136, 0.15)',
          border: '1px solid rgba(0, 255, 136, 0.3)',
          borderRadius: '0.5rem',
          color: '#00ff88',
        }}>
          <CheckCircle size={20} />
          <span style={{ fontWeight: '600' }}>🎉 Successfully minted {quantity} mech{quantity > 1 ? 's' : ''}!
          </span>
        </div>
      )}

      <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem' }}>
        <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
          💡 <strong style={{ color: '#94a3b8' }}>Tip:</strong> Newly minted mechs will appear in your 
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('setTab', { detail: 'collection' }))}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#00d4ff', 
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '0.875rem',
            }}
          >
            Collection
          </button>
          </p>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }
      `}</style>
    </div>
  );
}
