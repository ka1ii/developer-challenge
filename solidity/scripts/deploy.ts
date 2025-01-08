import { ethers } from "hardhat";

async function main() {

  const Coin = await ethers.getContractFactory("Coin");
  const initialSupply = ethers.utils.parseEther("1000");
  const coin = await Coin.deploy(initialSupply);
  await coin.deployed();

  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(coin.address);
  await marketplace.deployed();

  console.log("Contracts deployed!\nAdd the addresses to backend/index.ts:");
  console.log(`COIN_ADDRESS: ${coin.address}`);
  console.log(`MARKETPLACE_ADDRESS: ${marketplace.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
