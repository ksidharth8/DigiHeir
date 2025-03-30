import { ethers } from "hardhat";

async function main() {
  console.log("Deploying Will contract...");
  
  const Will = await ethers.getContractFactory("Will");
  const will = await Will.deploy();
  
  await will.deployed();
  
  console.log("Will contract deployed to:", will.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 