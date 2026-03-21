const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("StakingRewards", function () {
  let MechNFT, mechNFT, ForgeToken, forgeToken, StakingRewards, stakingRewards;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    // Deploy ForgeToken
    ForgeToken = await ethers.getContractFactory("ForgeToken");
    forgeToken = await ForgeToken.deploy();
    await forgeToken.waitForDeployment();

    // Deploy MechNFT
    MechNFT = await ethers.getContractFactory("MechNFT");
    mechNFT = await MechNFT.deploy("https://mechforge.api/metadata/");
    await mechNFT.waitForDeployment();

    // Deploy StakingRewards
    StakingRewards = await ethers.getContractFactory("StakingRewards");
    stakingRewards = await StakingRewards.deploy(
      await mechNFT.getAddress(),
      await forgeToken.getAddress()
    );
    await stakingRewards.waitForDeployment();

    // Authorize staking contract on mechNFT
    await mechNFT.authorizeMinter(await stakingRewards.getAddress());

    // Add staking contract as minter for forge tokens
    await forgeToken.addMinter(await stakingRewards.getAddress());

    // Mint mechs for testing
    const mintPrice = await mechNFT.MINT_PRICE();
    await mechNFT.connect(addr1).mint(2, { value: mintPrice * 2n });

    // Transfer tokens to staking contract for rewards
    await forgeToken.transfer(await stakingRewards.getAddress(), ethers.parseEther("10000"));
  });

  describe("Deployment", function () {
    it("Should set correct contract addresses", async function () {
      expect(await stakingRewards.mechNFT()).to.equal(await mechNFT.getAddress());
      expect(await stakingRewards.rewardToken()).to.equal(await forgeToken.getAddress());
    });

    it("Should have correct base reward rate", async function () {
      expect(await stakingRewards.baseRewardRate()).to.equal(ethers.parseEther("10"));
    });
  });

  describe("Staking", function () {
    it("Should stake a mech", async function () {
      await expect(stakingRewards.connect(addr1).stake(1))
        .to.emit(stakingRewards, "Staked")
        .withArgs(addr1.address, 1, await ethers.provider.getBlock("latest").then(b => b.timestamp + 1));
    });

    it("Should update mech staked status", async function () {
      await stakingRewards.connect(addr1).stake(1);
      const stats = await mechNFT.mechStats(1);
      expect(stats.staked).to.be.true;
    });

    it("Should fail if not mech owner", async function () {
      await expect(stakingRewards.connect(addr2).stake(1)).to.be.revertedWith("Not mech owner");
    });

    it("Should fail if already staked", async function () {
      await stakingRewards.connect(addr1).stake(1);
      await expect(stakingRewards.connect(addr1).stake(1)).to.be.revertedWith("Already staked");
    });
  });

  describe("Unstaking", function () {
    beforeEach(async function () {
      await stakingRewards.connect(addr1).stake(1);
    });

    it("Should unstake a mech", async function () {
      await expect(stakingRewards.connect(addr1).unstake(1))
        .to.emit(stakingRewards, "Unstaked");
    });

    it("Should update mech staked status on unstake", async function () {
      await stakingRewards.connect(addr1).unstake(1);
      const stats = await mechNFT.mechStats(1);
      expect(stats.staked).to.be.false;
    });

    it("Should fail if not staked", async function () {
      await expect(stakingRewards.connect(addr1).unstake(2)).to.be.revertedWith("Not staked");
    });

    it("Should fail if not stake owner", async function () {
      await expect(stakingRewards.connect(addr2).unstake(1)).to.be.revertedWith("Not stake owner");
    });
  });

  describe("Rewards", function () {
    beforeEach(async function () {
      await stakingRewards.connect(addr1).stake(1);
    });

    it("Should calculate pending rewards", async function () {
      // Advance time by 1 day
      await ethers.provider.send("evm_increaseTime", [86400]);
      await ethers.provider.send("evm_mine");

      const rewards = await stakingRewards.calculatePendingRewards(1);
      expect(rewards).to.be.gt(0);
    });

    it("Should claim rewards", async function () {
      // Advance time
      await ethers.provider.send("evm_increaseTime", [86400]);
      await ethers.provider.send("evm_mine");

      const balanceBefore = await forgeToken.balanceOf(addr1.address);
      await stakingRewards.connect(addr1).claimRewards(1);
      const balanceAfter = await forgeToken.balanceOf(addr1.address);

      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it("Should claim immediately with accumulated rewards", async function () {
      // After staking, there are no accumulated rewards yet but function doesn't revert
      // It just transfers 0 tokens
      await expect(stakingRewards.connect(addr1).claimRewards(1)).to.not.be.reverted;
    });
  });

  describe("User Stakes", function () {
    beforeEach(async function () {
      await stakingRewards.connect(addr1).stake(1);
      await stakingRewards.connect(addr1).stake(2);
    });

    it("Should return user stakes", async function () {
      const stakes = await stakingRewards.getUserStakes(addr1.address);
      expect(stakes.length).to.equal(2);
      expect(stakes[0]).to.equal(1);
      expect(stakes[1]).to.equal(2);
    });

    it("Should calculate total pending rewards", async function () {
      await ethers.provider.send("evm_increaseTime", [86400]);
      await ethers.provider.send("evm_mine");

      const totalRewards = await stakingRewards.calculateTotalPendingRewards(addr1.address);
      expect(totalRewards).to.be.gt(0);
    });

    it("Should unstake batch", async function () {
      await stakingRewards.connect(addr1).unstakeBatch([1, 2]);
      const stakes = await stakingRewards.getUserStakes(addr1.address);
      expect(stakes.length).to.equal(0);
    });
  });

  describe("Rarity Multipliers", function () {
    it("Should have correct rarity multipliers", async function () {
      expect(await stakingRewards.rarityMultiplier(1)).to.equal(100); // Common
      expect(await stakingRewards.rarityMultiplier(2)).to.equal(125); // Uncommon
      expect(await stakingRewards.rarityMultiplier(3)).to.equal(150); // Rare
      expect(await stakingRewards.rarityMultiplier(4)).to.equal(200); // Epic
      expect(await stakingRewards.rarityMultiplier(5)).to.equal(300); // Legendary
    });
  });
});
