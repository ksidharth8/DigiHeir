import { expect } from "chai";
import { ethers } from "hardhat";
import { Will } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("Will", function () {
  let will: Will;
  let owner: SignerWithAddress;
  let beneficiary1: SignerWithAddress;
  let beneficiary2: SignerWithAddress;
  let other: SignerWithAddress;

  beforeEach(async function () {
    [owner, beneficiary1, beneficiary2, other] = await ethers.getSigners();
    const Will = await ethers.getContractFactory("Will");
    will = await Will.deploy();
    await will.waitForDeployment();
  });

  describe("createWill", function () {
    it("should create a will successfully", async function () {
      const ipfsHash = "QmTest123";
      const inactivityPeriod = 86400; // 1 day

      await expect(will.connect(owner).createWill(ipfsHash, inactivityPeriod))
        .to.emit(will, "WillCreated")
        .withArgs(owner.address, ipfsHash);

      const willData = await will.wills(owner.address);
      expect(willData.exists).to.be.true;
      expect(willData.ipfsHash).to.equal(ipfsHash);
      expect(willData.inactivityPeriod).to.equal(inactivityPeriod);
    });

    it("should not allow creating multiple wills", async function () {
      const ipfsHash = "QmTest123";
      const inactivityPeriod = 86400;

      await will.connect(owner).createWill(ipfsHash, inactivityPeriod);

      await expect(
        will.connect(owner).createWill(ipfsHash, inactivityPeriod)
      ).to.be.revertedWith("Will already exists");
    });
  });

  describe("addBeneficiary", function () {
    beforeEach(async function () {
      await will.connect(owner).createWill("QmTest123", 86400);
    });

    it("should add beneficiaries successfully", async function () {
      await expect(
        will.connect(owner).addBeneficiary(beneficiary1.address, 60)
      )
        .to.emit(will, "BeneficiaryAdded")
        .withArgs(owner.address, beneficiary1.address, 60);

      await expect(
        will.connect(owner).addBeneficiary(beneficiary2.address, 40)
      )
        .to.emit(will, "BeneficiaryAdded")
        .withArgs(owner.address, beneficiary2.address, 40);

      const beneficiary1Data = await will.beneficiaries(
        owner.address,
        beneficiary1.address
      );
      const beneficiary2Data = await will.beneficiaries(
        owner.address,
        beneficiary2.address
      );

      expect(beneficiary1Data.exists).to.be.true;
      expect(beneficiary1Data.share).to.equal(60);
      expect(beneficiary2Data.exists).to.be.true;
      expect(beneficiary2Data.share).to.equal(40);
    });

    it("should not allow non-owner to add beneficiaries", async function () {
      await expect(
        will.connect(other).addBeneficiary(beneficiary1.address, 100)
      ).to.be.revertedWith("Will does not exist");
    });
  });

  describe("executeWill", function () {
    beforeEach(async function () {
      await will.connect(owner).createWill("QmTest123", 86400);
      await will.connect(owner).addBeneficiary(beneficiary1.address, 60);
      await will.connect(owner).addBeneficiary(beneficiary2.address, 40);
    });

    it("should execute will after inactivity period", async function () {
      // Send some ETH to the contract
      await owner.sendTransaction({
        to: await will.getAddress(),
        value: ethers.parseEther("1.0"),
      });

      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [86401]);
      await ethers.provider.send("evm_mine");

      // Execute will
      await expect(will.connect(other).executeWill(owner.address))
        .to.emit(will, "WillExecuted")
        .withArgs(owner.address, beneficiary1.address, ethers.parseEther("0.6"));

      await expect(will.connect(other).executeWill(owner.address))
        .to.emit(will, "WillExecuted")
        .withArgs(owner.address, beneficiary2.address, ethers.parseEther("0.4"));
    });

    it("should not execute will before inactivity period", async function () {
      await expect(
        will.connect(other).executeWill(owner.address)
      ).to.be.revertedWith("Inactivity period not met");
    });
  });

  describe("updateInactivityPeriod", function () {
    beforeEach(async function () {
      await will.connect(owner).createWill("QmTest123", 86400);
    });

    it("should update inactivity period successfully", async function () {
      const newPeriod = 172800; // 2 days

      await expect(will.connect(owner).updateInactivityPeriod(newPeriod))
        .to.emit(will, "InactivityPeriodUpdated")
        .withArgs(owner.address, newPeriod);

      const willData = await will.wills(owner.address);
      expect(willData.inactivityPeriod).to.equal(newPeriod);
    });

    it("should not allow non-owner to update inactivity period", async function () {
      await expect(
        will.connect(other).updateInactivityPeriod(172800)
      ).to.be.revertedWith("Will does not exist");
    });
  });
}); 