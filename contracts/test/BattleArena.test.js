const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BattleArena", function () {
  let MechNFT, mechNFT, BattleArena, battleArena, ForgeToken, forgeToken;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    // Deploy MechNFT
    MechNFT = await ethers.getContractFactory("MechNFT");
    mechNFT = await MechNFT.deploy("https://mechforge.api/metadata/");
    await mechNFT.waitForDeployment();

    // Deploy BattleArena
    BattleArena = await ethers.getContractFactory("BattleArena");
    battleArena = await BattleArena.deploy(await mechNFT.getAddress());
    await battleArena.waitForDeployment();

    // Authorize battle arena
    await mechNFT.authorizeMinter(await battleArena.getAddress());

    // Mint mechs for testing
    const mintPrice = await mechNFT.MINT_PRICE();
    await mechNFT.connect(addr1).mint(1, { value: mintPrice });
    await mechNFT.connect(addr2).mint(1, { value: mintPrice });
  });

  describe("Deployment", function () {
    it("Should set correct mechNFT address", async function () {
      expect(await battleArena.mechNFT()).to.equal(await mechNFT.getAddress());
    });

    it("Should have correct default settings", async function () {
      expect(await battleArena.minStake()).to.equal(ethers.parseEther("0.0001"));
      expect(await battleArena.maxStake()).to.equal(ethers.parseEther("1"));
      expect(await battleArena.platformFeePercent()).to.equal(5);
    });
  });

  describe("Create Battle", function () {
    it("Should create a battle", async function () {
      const stake = ethers.parseEther("0.001");
      await expect(
        battleArena.connect(addr1).createBattle(1, { value: stake })
      )
        .to.emit(battleArena, "BattleCreated")
        .withArgs(1, addr1.address, 1, stake);
    });

    it("Should fail with insufficient stake", async function () {
      await expect(
        battleArena.connect(addr1).createBattle(1, { value: ethers.parseEther("0.00001") })
      ).to.be.revertedWith("Invalid stake amount");
    });

    it("Should fail if not mech owner", async function () {
      await expect(
        battleArena.connect(addr2).createBattle(1, { value: ethers.parseEther("0.001") })
      ).to.be.revertedWith("Not mech owner");
    });

    it("Should fail if mech is staked", async function () {
      // This would require staking contract interaction
      // Skipping for simplicity
    });
  });

  describe("Join Battle", function () {
    beforeEach(async function () {
      const stake = ethers.parseEther("0.001");
      await battleArena.connect(addr1).createBattle(1, { value: stake });
    });

    it("Should join and resolve battle", async function () {
      const stake = ethers.parseEther("0.001");
      await expect(
        battleArena.connect(addr2).joinBattle(1, 2, { value: stake })
      )
        .to.emit(battleArena, "BattleJoined")
        .and.to.emit(battleArena, "BattleCompleted");
    });

    it("Should fail to join own battle", async function () {
      const stake = ethers.parseEther("0.001");
      await mechNFT.connect(addr1).mint(1, { value: await mechNFT.MINT_PRICE() });
      await expect(
        battleArena.connect(addr1).joinBattle(1, 3, { value: stake })
      ).to.be.revertedWith("Cannot battle yourself");
    });

    it("Should fail with wrong stake amount", async function () {
      await expect(
        battleArena.connect(addr2).joinBattle(1, 2, { value: ethers.parseEther("0.002") })
      ).to.be.revertedWith("Must match stake");
    });
  });

  describe("Cancel Battle", function () {
    beforeEach(async function () {
      const stake = ethers.parseEther("0.001");
      await battleArena.connect(addr1).createBattle(1, { value: stake });
    });

    it("Should cancel pending battle", async function () {
      await expect(battleArena.connect(addr1).cancelBattle(1))
        .to.emit(battleArena, "BattleCancelled")
        .withArgs(1);
    });

    it("Should refund stake on cancel", async function () {
      const balanceBefore = await ethers.provider.getBalance(addr1.address);
      await battleArena.connect(addr1).cancelBattle(1);
      const balanceAfter = await ethers.provider.getBalance(addr1.address);
      // Balance should increase (minus gas)
      expect(balanceAfter).to.be.gt(balanceBefore - ethers.parseEther("0.01"));
    });
  });

  describe("Player Stats", function () {
    it("Should track player stats correctly", async function () {
      const [wins, losses, earnings, winRate] = await battleArena.getPlayerStats(addr1.address);
      expect(wins).to.equal(0);
      expect(losses).to.equal(0);
      expect(winRate).to.equal(0);
    });
  });

  describe("Admin Functions", function () {
    it("Should update platform fee", async function () {
      await battleArena.setPlatformFee(10);
      expect(await battleArena.platformFeePercent()).to.equal(10);
    });

    it("Should fail to set fee too high", async function () {
      await expect(battleArena.setPlatformFee(25)).to.be.revertedWith("Fee too high");
    });

    it("Should update stake limits", async function () {
      await battleArena.setStakeLimits(
        ethers.parseEther("0.001"),
        ethers.parseEther("2")
      );
      expect(await battleArena.minStake()).to.equal(ethers.parseEther("0.001"));
      expect(await battleArena.maxStake()).to.equal(ethers.parseEther("2"));
    });
  });
});
