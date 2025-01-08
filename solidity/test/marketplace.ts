import { expect } from "chai";
import { ethers } from "hardhat";
import { Coin, Marketplace } from "../typechain-types";
import { Provider } from "@ethersproject/abstract-provider";
import { Signer } from "ethers";

describe("Marketplace Contract", function () {
  let Coin, Marketplace, coin: Coin, marketplace : Marketplace, owner, addr1: Signer, addr2: Signer;

  // Deploy contracts before each test
  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners(); // Get test accounts

    // Deploy the Coin contract
    Coin = await ethers.getContractFactory("Coin");
    coin = await Coin.deploy(ethers.utils.parseEther("1000")); // 1000 tokens
    await coin.deployed();

    // Deploy the Marketplace contract
    Marketplace = await ethers.getContractFactory("Marketplace");
    marketplace = await Marketplace.deploy(coin.address);
    await marketplace.deployed();
  });

  describe("Deployment", function () {
    it("Should set the correct Coin address", async function () {
      expect(await marketplace.coin()).to.equal(coin.address);
    });
  });

  describe("Creating Posts", function () {
    it("Should allow users to create posts with a client address", async function () {
      const postId = "post1";

      // Create a post
      await marketplace.connect(addr1).createPost(postId, "0x0000000000000000000000000000000000000000");

      // captures the event
      const event = await marketplace.queryFilter(marketplace.filters.PostCreated());
      expect(event.length).to.equal(1);
      expect(event[0].args.client).to.equal(await addr1.getAddress());
      expect(event[0].args.freelancer).to.equal("0x0000000000000000000000000000000000000000");

      // Verify post details
      const post = await marketplace.getPosts(postId);
      expect(post.freelancer).to.equal(await addr1.getAddress());
      expect(post.client).to.equal("0x0000000000000000000000000000000000000000");
    });

    it("Should store multiple posts", async function () {
      await marketplace.connect(addr1).createPost("post1", "0x0000000000000000000000000000000000000000");
      await marketplace.connect(addr2).createPost("post2", "0x1111111111111111111111111111111111111111");

      const post1 = await marketplace.getPosts("post1");
      const post2 = await marketplace.getPosts("post2");
      expect(post1.freelancer).to.equal(await addr1.getAddress());
      expect(post1.client).to.equal("0x0000000000000000000000000000000000000000");
      expect(post2.freelancer).to.equal(await addr2.getAddress());
      expect(post2.client).to.equal("0x1111111111111111111111111111111111111111");

    });
  });

});
