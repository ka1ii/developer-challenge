import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";

describe("Escrow Contract", function () {
  let CoinFactory: any;
  let EscrowFactory: any;
  let coin: Contract;
  let escrow: Contract;
  let owner: SignerWithAddress;
  let client: SignerWithAddress;
  let freelancer: SignerWithAddress;
  let otherUser: SignerWithAddress;

  // Example CID for testing
  const cid = "QmExampleCID123456";

  before(async function () {
    // Get Signers
    [owner, client, freelancer, otherUser] = await ethers.getSigners();

    // Prepare factory objects for Coin and Escrow
    CoinFactory = await ethers.getContractFactory("Coin");
    EscrowFactory = await ethers.getContractFactory("Escrow");
  });

  beforeEach(async function () {
    // Deploy a fresh Coin contract before each test
    coin = await CoinFactory.connect(owner).deploy(ethers.utils.parseEther("1000"));
    await coin.deployed();

    // Deploy the Escrow contract, passing in the Coin token address
    escrow = await EscrowFactory.connect(owner).deploy(coin.address);
    await escrow.deployed();

    // Distribute some tokens to "client" so they can use the escrow
    // By default, the "owner" might hold all minted tokens, so let's transfer some to the client
    const transferAmount = ethers.utils.parseEther("200");
    await coin.connect(owner).transfer(client.address, transferAmount);

    // Optionally, distribute tokens to others as needed
  });

  describe("Deployment", function () {
    it("Should set the correct ERC20 token address in the Escrow", async function () {
      const tokenAddress = await escrow.token();
      expect(tokenAddress).to.equal(coin.address);
    });
  });

  describe("Creating Agreements", function () {
    it("Should allow the client to create a new agreement with a unique CID", async function () {
      // 1) Client must approve the escrow to spend tokens
      const amount = ethers.utils.parseEther("50");
      await coin.connect(client).approve(escrow.address, amount);

      // 2) Create the agreement
      await escrow.connect(client).createAgreement(cid, freelancer.address, amount);

      // 3) Check stored agreement data
      const agreement = await escrow.getAgreement(cid);
      expect(agreement.client).to.equal(client.address);
      expect(agreement.freelancer).to.equal(freelancer.address);
      expect(agreement.amount).to.equal(amount);
      expect(agreement.handshake).to.equal(false);

      // 4) Verify escrow contract actually holds the tokens
      const escrowBalance = await coin.balanceOf(escrow.address);
      expect(escrowBalance).to.equal(amount);
    });

    it("Should revert if an agreement with the same CID already exists", async function () {
      const amount = ethers.utils.parseEther("10");
      await coin.connect(client).approve(escrow.address, amount);

      // First time creating the agreement
      await escrow.connect(client).createAgreement(cid, freelancer.address, amount);

      // Attempt to create a second agreement with the same CID
      await expect(
        escrow.connect(client).createAgreement(cid, freelancer.address, amount)
      ).to.be.revertedWith("Agreement with this CID already exists");
    });

    it("Should fail if the freelancer does not approve the escrow contract", async function () {
      // The freelancer does NOT call 'approve' here

      const amount = ethers.utils.parseEther("10");
      await coin.connect(client).approve(escrow.address, amount);

      // 2) Create the agreement
      await escrow.connect(client).createAgreement(cid, freelancer.address, amount);

      // 3) Check stored agreement data
      const agreement = await escrow.getAgreement(cid);
      expect(agreement.client).to.equal(client.address);
      expect(agreement.freelancer).to.equal(freelancer.address);
      expect(agreement.amount).to.equal(amount);
      expect(agreement.handshake).to.equal(false);

      // 4) The client can't release funds because the freelancer hasn't approved the escrow contract
      await expect(
        escrow.connect(client).releaseFunds(cid, amount)
      ).to.be.revertedWith("Contract not handshaked");
    });
  });

  describe("Adding Funds", function () {
    const initialAmount = ethers.utils.parseEther("20");
    const additionalAmount = ethers.utils.parseEther("10");

    beforeEach(async () => {
      // Create initial agreement with 20 tokens
      await coin.connect(client).approve(escrow.address, initialAmount);
      await escrow.connect(client).createAgreement(cid, freelancer.address, initialAmount);
    });

    it("Should allow the client to add funds to an existing agreement", async function () {
      // Approve for additional 10 tokens
      await coin.connect(client).approve(escrow.address, additionalAmount);

      // Add funds
      await escrow.connect(client).addFunds(cid, additionalAmount);

      // Check new total
      const agreement = await escrow.getAgreement(cid);
      expect(agreement.amount).to.equal(initialAmount.add(additionalAmount));
    });

    it("Should revert if a non-client tries to add funds", async function () {
      await coin.connect(otherUser).approve(escrow.address, additionalAmount);
      await expect(
        escrow.connect(otherUser).addFunds(cid, additionalAmount)
      ).to.be.revertedWith("No permission to add funds");
    });
  });

  describe("Releasing Funds", function () {
    const depositAmount = ethers.utils.parseEther("50");

    beforeEach(async () => {
      // Create an agreement with 50 tokens
      await coin.connect(client).approve(escrow.address, depositAmount);
      await escrow.connect(client).createAgreement(cid, freelancer.address, depositAmount);
    });

    it("Should allow the client to release partial funds", async function () {
      const partialRelease = ethers.utils.parseEther("20");

      // Freelancer must approve the escrow contract first
      await escrow.connect(freelancer).approve(cid);

      // Release 20 out of 50
      await escrow.connect(client).releaseFunds(cid, partialRelease);

      // Check Escrow's new stored amount
      const agreement = await escrow.getAgreement(cid);
      expect(agreement.amount).to.equal(depositAmount.sub(partialRelease));

      // Check Freelancer's balance
      const freelancerBalance = await coin.balanceOf(freelancer.address);
      expect(freelancerBalance).to.equal(partialRelease);
    });

    it("Should allow the client to release all funds", async function () {
      // Freelancer must approve the escrow contract first
      await escrow.connect(freelancer).approve(cid);

      await escrow.connect(client).releaseFunds(cid, depositAmount);
      const agreement = await escrow.getAgreement(cid);

      // Should be zero after releasing everything
      expect(agreement.amount).to.equal(0);

      // Freelancer's balance should now be depositAmount
      const freelancerBalance = await coin.balanceOf(freelancer.address);
      expect(freelancerBalance).to.equal(depositAmount);
    });

    it("Should revert if a non-client tries to release funds", async function () {
      // Freelancer must approve the escrow contract first
      await escrow.connect(freelancer).approve(cid);

      await expect(
        escrow.connect(otherUser).releaseFunds(cid, ethers.utils.parseEther("10"))
      ).to.be.revertedWith("No permission to release funds");
    });

    it("Should revert if trying to release more than escrowed", async function () {
      
      // Freelancer must approve the escrow contract first
      await escrow.connect(freelancer).approve(cid);

      // Attempt to release 60, but only 50 is in escrow
      await expect(
        escrow.connect(client).releaseFunds(cid, ethers.utils.parseEther("60"))
      ).to.be.revertedWith("Amount to release exceeds total escrowed amount");
    });
  });

  describe("Edge Cases", function () {
    it("Should return a default Agreement if CID not found", async function () {
      const unknownCid = "QmUnknownCID";
      const agreement = await escrow.getAgreement(unknownCid);

      // By default, an empty struct has zero addresses & zero amount
      expect(agreement.client).to.equal(ethers.constants.AddressZero);
      expect(agreement.freelancer).to.equal(ethers.constants.AddressZero);
      expect(agreement.amount).to.equal(0);
    });
  });
});
