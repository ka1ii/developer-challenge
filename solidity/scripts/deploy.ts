import { ethers } from "hardhat";

async function main() {

  const Coin = await ethers.getContractFactory("Coin");
  const coin = await Coin.deploy(1000);
  await coin.deployed();

  const Escrow = await ethers.getContractFactory("Escrow");
  const escrow = await Escrow.deploy(coin.address);
  await escrow.deployed();

  console.log("Contracts deployed!\nAdd the addresses to backend/index.ts:");
  console.log(`COIN_ADDRESS: ${coin.address}`);
  console.log(`ESCROW_ADDRESS: ${escrow.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
