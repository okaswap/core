import { ethers } from "hardhat";

async function main() {
  const factory = await ethers.getContractFactory("Oka");
  const initCode = factory.getDeployTransaction().data!;
  const initHash = ethers.utils.keccak256(initCode);

  console.log("InitCode:", initCode);
  console.log("InitCodeHash:", initHash);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
