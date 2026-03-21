import { Sword, Shield, Coins, Trophy, Sparkles, Users } from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'Mint Unique Mechs',
    description: 'Generate one-of-a-kind mech NFTs with randomized stats, rarities, and attributes. Each mech is truly unique and stored on-chain forever.',
  },
  {
    icon: Sword,
    title: 'PvP Battle Arena',
    description: 'Challenge other players to intense mech battles. Stake ETH, fight for glory, and win big. Real-time combat with strategic depth.',
  },
  {
    icon: Shield,
    title: 'Strategic Combat',
    description: 'Five unique mech types - Assault, Tank, Scout, Sniper, and Support. Build your perfect team and dominate the arena.',
  },
  {
    icon: Coins,
    title: 'Earn FORGE Tokens',
    description: 'Stake your mechs to earn passive FORGE token rewards. Higher rarity mechs earn more. 125% APR for active stakers.',
  },
  {
    icon: Trophy,
    title: 'Climb the Ranks',
    description: 'Compete on global leaderboards. Earn exclusive rewards, special titles, and bragging rights as you rise to the top.',
  },
  {
    icon: Users,
    title: 'Web3 Community',
    description: 'Join a thriving community of mech pilots. Trade, strategize, and forge alliances in the ultimate gaming metaverse.',
  },
];

export default function Features() {
  return (
    <section id="features" className="features-section">
      <div className="section-header">
        <h2 className="section-title">Game Features</h2>
        <p className="section-subtitle">
          Experience the next generation of Web3 gaming with MechForge. 
          Collect, battle, and earn in a fully decentralized mech universe.
        </p>
      </div>

      <div className="features-grid">
        {features.map((feature, index) => (
          <div 
            key={feature.title}
            className="feature-card"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="feature-icon">
              <feature.icon size={32} />
            </div>
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-description">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
