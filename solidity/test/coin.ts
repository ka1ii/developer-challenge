import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Coin", function () {
  async function deployCoinContract() {
    const [owner] = await ethers.getSigners();
    const Coin = await ethers.getContractFactory("Coin");
    const coin = await Coin.deploy(1000);

    return { coin, owner };
  }

  describe("mint", function () {
    it("Should deploy token and mint", async function () {
      const { coin, owner } = await loadFixture(deployCoinContract);
      // Verify name and symbol
      expect(await coin.name()).to.equal("Coin");
      expect(await coin.symbol()).to.equal("COIN");
      // Accounts should be 0 after contract is deployed
      expect(await coin.balanceOf(owner.address)).to.equal(1000);
      // Mint token to accountA
      await coin.mint(1);
      expect(await coin.balanceOf(owner.address)).to.equal(1001);
    });
  });
});
