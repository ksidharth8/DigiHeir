import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { DigiHeir } from "../typechain-types";

describe("DigiHeir", function () {
  let digiHeir: DigiHeir;
  let owner: SignerWithAddress;
  let beneficiary1: SignerWithAddress;
  let beneficiary2: SignerWithAddress;
  let otherUser: SignerWithAddress;

  beforeEach(async function () {
    [owner, beneficiary1, beneficiary2, otherUser] = await ethers.getSigners();
    const DigiHeir = await ethers.getContractFactory("DigiHeir");
    digiHeir = await DigiHeir.deploy();
    await digiHeir.deployed();
  });

  describe("createWill", function () {
    it("should create a new will successfully", async function () {
      const ipfsHash = "QmTest123";
      const beneficiaries = [beneficiary1.address, beneficiary2.address];
      const sharePercentages = [60, 40];
      const inactivityPeriod = 30 * 24 * 60 * 60; // 30 days in seconds

      await expect(
        digiHeir.createWill(ipfsHash, beneficiaries, sharePercentages, inactivityPeriod)
      )
        .to.emit(digiHeir, "WillCreated")
        .withArgs(owner.address, ipfsHash);

      const will = await digiHeir.getWill(owner.address);
      expect(will.ipfsHash).to.equal(ipfsHash);
      expect(will.inactivityPeriod).to.equal(inactivityPeriod);
      expect(will.beneficiaries.length).to.equal(2);
    });

    it("should fail if will already exists", async function () {
      const ipfsHash = "QmTest123";
      const beneficiaries = [beneficiary1.address];
      const sharePercentages = [100];
      const inactivityPeriod = 30 * 24 * 60 * 60;

      await digiHeir.createWill(ipfsHash, beneficiaries, sharePercentages, inactivityPeriod);

      await expect(
        digiHeir.createWill(ipfsHash, beneficiaries, sharePercentages, inactivityPeriod)
      ).to.be.revertedWith("Will already exists");
    });

    it("should fail if total percentage is not 100", async function () {
      const ipfsHash = "QmTest123";
      const beneficiaries = [beneficiary1.address, beneficiary2.address];
      const sharePercentages = [60, 30]; // Total 90%
      const inactivityPeriod = 30 * 24 * 60 * 60;

      await expect(
        digiHeir.createWill(ipfsHash, beneficiaries, sharePercentages, inactivityPeriod)
      ).to.be.revertedWith("Total percentage must be 100");
    });
  });

  describe("updateWill", function () {
    beforeEach(async function () {
      const ipfsHash = "QmTest123";
      const beneficiaries = [beneficiary1.address];
      const sharePercentages = [100];
      const inactivityPeriod = 30 * 24 * 60 * 60;

      await digiHeir.createWill(ipfsHash, beneficiaries, sharePercentages, inactivityPeriod);
    });

    it("should update will successfully", async function () {
      const newIpfsHash = "QmTest456";
      const newBeneficiaries = [beneficiary1.address, beneficiary2.address];
      const newSharePercentages = [60, 40];
      const newInactivityPeriod = 60 * 24 * 60 * 60; // 60 days

      await expect(
        digiHeir.updateWill(newIpfsHash, newBeneficiaries, newSharePercentages, newInactivityPeriod)
      )
        .to.emit(digiHeir, "WillUpdated")
        .withArgs(owner.address, newIpfsHash);

      const will = await digiHeir.getWill(owner.address);
      expect(will.ipfsHash).to.equal(newIpfsHash);
      expect(will.inactivityPeriod).to.equal(newInactivityPeriod);
      expect(will.beneficiaries.length).to.equal(2);
    });

    it("should fail if will does not exist", async function () {
      const ipfsHash = "QmTest123";
      const beneficiaries = [beneficiary1.address];
      const sharePercentages = [100];
      const inactivityPeriod = 30 * 24 * 60 * 60;

      await expect(
        digiHeir.connect(otherUser).updateWill(ipfsHash, beneficiaries, sharePercentages, inactivityPeriod)
      ).to.be.revertedWith("Will does not exist");
    });
  });

  describe("checkInactivityAndDistribute", function () {
    beforeEach(async function () {
      const ipfsHash = "QmTest123";
      const beneficiaries = [beneficiary1.address, beneficiary2.address];
      const sharePercentages = [60, 40];
      const inactivityPeriod = 30 * 24 * 60 * 60;

      await digiHeir.createWill(ipfsHash, beneficiaries, sharePercentages, inactivityPeriod);
    });

    it("should distribute assets after inactivity period", async function () {
      // Send some ETH to the contract
      await owner.sendTransaction({
        to: digiHeir.address,
        value: ethers.utils.parseEther("1.0")
      });

      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [31 * 24 * 60 * 60]); // 31 days
      await ethers.provider.send("evm_mine");

      const initialBalance1 = await beneficiary1.getBalance();
      const initialBalance2 = await beneficiary2.getBalance();

      await digiHeir.checkInactivityAndDistribute(owner.address);

      const finalBalance1 = await beneficiary1.getBalance();
      const finalBalance2 = await beneficiary2.getBalance();

      // Check if beneficiaries received their shares
      expect(finalBalance1).to.be.gt(initialBalance1);
      expect(finalBalance2).to.be.gt(initialBalance2);
    });

    it("should fail if inactivity period not reached", async function () {
      await expect(
        digiHeir.checkInactivityAndDistribute(owner.address)
      ).to.be.revertedWith("Inactivity period not reached");
    });
  });
}); 