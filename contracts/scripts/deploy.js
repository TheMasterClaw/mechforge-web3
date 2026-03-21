const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying MechForge contracts to Base Sepolia...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Deploy ForgeToken first
  console.log("\n📦 Deploying ForgeToken...");
  const ForgeToken = await hre.ethers.getContractFactory("ForgeToken");
  const forgeToken = await ForgeToken.deploy();
  await forgeToken.waitForDeployment();
  const forgeTokenAddress = await forgeToken.getAddress();
  console.log("✅ ForgeToken deployed to:", forgeTokenAddress);

  // Deploy MechNFT
  console.log("\n📦 Deploying MechNFT...");
  const MechNFT = await hre.ethers.getContractFactory("MechNFT");
  const mechNFT = await MechNFT.deploy("https://api.mechforge.xyz/metadata/");
  await mechNFT.waitForDeployment();
  const mechNFTAddress = await mechNFT.getAddress();
  console.log("✅ MechNFT deployed to:", mechNFTAddress);

  // Deploy BattleArena
  console.log("\n📦 Deploying BattleArena...");
  const BattleArena = await hre.ethers.getContractFactory("BattleArena");
  const battleArena = await BattleArena.deploy(mechNFTAddress);
  await battleArena.waitForDeployment();
  const battleArenaAddress = await battleArena.getAddress();
  console.log("✅ BattleArena deployed to:", battleArenaAddress);

  // Deploy StakingRewards
  console.log("\n📦 Deploying StakingRewards...");
  const StakingRewards = await hre.ethers.getContractFactory("StakingRewards");
  const stakingRewards = await StakingRewards.deploy(mechNFTAddress, forgeTokenAddress);
  await stakingRewards.waitForDeployment();
  const stakingRewardsAddress = await stakingRewards.getAddress();
  console.log("✅ StakingRewards deployed to:", stakingRewardsAddress);

  // Authorize contracts
  console.log("\n🔐 Setting up permissions...");
  
  await (await mechNFT.authorizeMinter(battleArenaAddress)).wait();
  console.log("✅ BattleArena authorized as minter on MechNFT");
  
  await (await mechNFT.authorizeMinter(stakingRewardsAddress)).wait();
  console.log("✅ StakingRewards authorized as minter on MechNFT");
  
  await (await forgeToken.addMinter(deployer.address)).wait();
  console.log("✅ Deployer added as ForgeToken minter");
  
  // Fund staking contract with initial rewards
  console.log("\n💰 Funding StakingRewards with initial reward tokens...");
  const fundAmount = hre.ethers.parseEther("1000000"); // 1M tokens
  await (await forgeToken.transfer(stakingRewardsAddress, fundAmount)).wait();
  console.log("✅ StakingRewards funded with 1,000,000 FORGE");

  // Save deployment info
  const deploymentInfo = {
    network: "base-sepolia",
    chainId: 84532,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      ForgeToken: forgeTokenAddress,
      MechNFT: mechNFTAddress,
      BattleArena: battleArenaAddress,
      StakingRewards: stakingRewardsAddress
    }
  };

  // Save to contracts directory
  const contractsDir = path.join(__dirname, "..");
  fs.writeFileSync(
    path.join(contractsDir, "deployment.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  // Save to frontend public directory for easy access
  const frontendPublicDir = path.join(__dirname, "../../frontend/public");
  if (fs.existsSync(frontendPublicDir)) {
    fs.writeFileSync(
      path.join(frontendPublicDir, "contracts.json"),
      JSON.stringify(deploymentInfo, null, 2)
    );
  }

  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log("\n📋 Contract Addresses:");
  console.log("   ForgeToken:   ", forgeTokenAddress);
  console.log("   MechNFT:      ", mechNFTAddress);
  console.log("   BattleArena:  ", battleArenaAddress);
  console.log("   StakingRewards:", stakingRewardsAddress);
  console.log("\n📝 Deployment info saved to: deployment.json");
  console.log("\n🔗 View on Base Sepolia Explorer:");
  console.log(`   https://sepolia.basescan.org/address/${mechNFTAddress}`);
  console.log("=".repeat(60) + "\n");

  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });