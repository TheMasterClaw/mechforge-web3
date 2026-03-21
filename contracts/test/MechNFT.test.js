const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MechNFT", function () {
  let MechNFT, mechNFT, owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    MechNFT = await ethers.getContractFactory("MechNFT");
    mechNFT = await MechNFT.deploy("https://mechforge.api/metadata/");
    await mechNFT.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await mechNFT.owner()).to.equal(owner.address);
    });

    it("Should have correct name and symbol", async function () {
      expect(await mechNFT.name()).to.equal("MechForge");
      expect(await mechNFT.symbol()).to.equal("MECH");
    });

    it("Should have correct mint price", async function () {
      expect(await mechNFT.MINT_PRICE()).to.equal(ethers.parseEther("0.001"));
    });
  });

  describe("Minting", function () {
    it("Should mint a mech with correct payment", async function () {
      const mintPrice = await mechNFT.MINT_PRICE();
      const tx = await mechNFT.connect(addr1).mint(1, { value: mintPrice });
      const receipt = await tx.wait();
      
      // Check event was emitted
      expect(receipt.logs.length).to.be.gt(0);
      
      // Check mech was minted to correct owner
      expect(await mechNFT.ownerOf(1)).to.equal(addr1.address);
      
      // Check mech has stats
      const stats = await mechNFT.mechStats(1);
      expect(stats.mechType).to.be.gte(1).and.lte(5);
      expect(stats.rarity).to.be.gte(1).and.lte(5);
    });

    it("Should fail with insufficient payment", async function () {
      await expect(
        mechNFT.connect(addr1).mint(1, { value: ethers.parseEther("0.0001") })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should mint multiple mechs", async function () {
      const mintPrice = await mechNFT.MINT_PRICE();
      await mechNFT.connect(addr1).mint(3, { value: mintPrice * 3n });
      expect(await mechNFT.balanceOf(addr1.address)).to.equal(3);
    });

    it("Should respect max mint per transaction", async function () {
      const mintPrice = await mechNFT.MINT_PRICE();
      await expect(
        mechNFT.connect(addr1).mint(6, { value: mintPrice * 6n })
      ).to.be.revertedWith("Invalid quantity");
    });
  });

  describe("Mech Stats", function () {
    it("Should generate stats on mint", async function () {
      const mintPrice = await mechNFT.MINT_PRICE();
      await mechNFT.connect(addr1).mint(1, { value: mintPrice });
      
      const stats = await mechNFT.getMechStats(1);
      expect(stats.level).to.equal(1);
      expect(stats.attack).to.be.gt(0);
      expect(stats.defense).to.be.gt(0);
      expect(stats.health).to.be.gt(0);
    });

    it("Should return mechs by owner", async function () {
      const mintPrice = await mechNFT.MINT_PRICE();
      await mechNFT.connect(addr1).mint(2, { value: mintPrice * 2n });
      
      const mechs = await mechNFT.getMechsByOwner(addr1.address);
      expect(mechs.length).to.equal(2);
    });
  });

  describe("Experience and Leveling", function () {
    beforeEach(async function () {
      const mintPrice = await mechNFT.MINT_PRICE();
      await mechNFT.connect(addr1).mint(1, { value: mintPrice });
      await mechNFT.authorizeMinter(owner.address);
    });

    it("Should authorize minter", async function () {
      expect(await mechNFT.authorizedMinters(owner.address)).to.be.true;
    });

    it("Should gain experience", async function () {
      await mechNFT.gainExperience(1, 50);
      const stats = await mechNFT.mechStats(1);
      expect(stats.experience).to.equal(50);
    });

    it("Should level up when enough experience", async function () {
      await mechNFT.gainExperience(1, 150); // More than level 1 requirement (100)
      const stats = await mechNFT.mechStats(1);
      expect(stats.level).to.be.gt(1);
    });
  });

  describe("Battle Record", function () {
    beforeEach(async function () {
      const mintPrice = await mechNFT.MINT_PRICE();
      await mechNFT.connect(addr1).mint(1, { value: mintPrice });
      await mechNFT.authorizeMinter(owner.address);
    });

    it("Should update battle record for win", async function () {
      await mechNFT.updateBattleRecord(1, true);
      const stats = await mechNFT.mechStats(1);
      expect(stats.battlesWon).to.equal(1);
    });

    it("Should update battle record for loss", async function () {
      await mechNFT.updateBattleRecord(1, false);
      const stats = await mechNFT.mechStats(1);
      expect(stats.battlesLost).to.equal(1);
    });
  });
});
