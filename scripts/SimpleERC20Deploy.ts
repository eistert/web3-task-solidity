import { ethers } from "hardhat";

async function main() {
  const F = await ethers.getContractFactory("SimpleERC20");
  const token = await F.deploy("Demo Token", "DMT", 18);
  await token.waitForDeployment();
  console.log("ERC20 deployed to:", await token.getAddress());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
