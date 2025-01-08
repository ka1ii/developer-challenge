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
    it("Should allow users to create posts", async function () {
      const postId = "post1";
      const title = "First Post";

      // Create a post
      await marketplace.connect(addr1).createPost(postId, title);

      // Verify post details
      const posts = await marketplace.getPosts();
      expect(posts.length).to.equal(1);
      expect(posts[0].seller).to.equal(await addr1.getAddress());
      expect(posts[0].id).to.equal(postId);
      expect(posts[0].title).to.equal(title);
    });

    it("Should store multiple posts", async function () {
      await marketplace.connect(addr1).createPost("post1", "First Post");
      await marketplace.connect(addr2).createPost("post2", "Second Post");

      const posts = await marketplace.getPosts();
      expect(posts.length).to.equal(2);

      // Verify first post
      expect(posts[0].seller).to.equal(await addr1.getAddress());
      expect(posts[0].id).to.equal("post1");
      expect(posts[0].title).to.equal("First Post");

      // Verify second post
      expect(posts[1].seller).to.equal(await addr2.getAddress());
      expect(posts[1].id).to.equal("post2");
      expect(posts[1].title).to.equal("Second Post");
    });
  });

//   describe("Retrieving Posts", function () {
//     it("Should return all posts", async function () {
//       await marketplace.connect(addr1).createPost("post1", "First Post");
//       await marketplace.connect(addr2).createPost("post2", "Second Post");

//       const posts = await marketplace.getPosts();

//       expect(posts.length).to.equal(2);
//       expect(posts[0].seller).to.equal(await addr1.getAddress());
//       expect(posts[1].seller).to.equal(await addr2.getAddress());
//     });

//     it("Should return an empty array if no posts exist", async function () {
//       const posts = await marketplace.getPosts();
//       expect(posts.length).to.equal(0);
//     });
//   });
});
