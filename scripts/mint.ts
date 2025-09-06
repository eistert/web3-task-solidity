import { ethers } from "hardhat";

async function main() {
  const tokenAddr = process.env.TOKEN_ADDR!;      // 把部署地址写进 .env 或手填
  const to        = process.env.MY_ADDR!;         // 你的钱包地址
  const amount    = ethers.parseUnits("1000", 18); // 铸 1000 DMT

  const token = await ethers.getContractAt("SimpleERC20", tokenAddr);
  const tx = await token.mint(to, amount);        // 只有部署者(owner)能成功
  console.log("mint tx:", tx.hash);
  await tx.wait();
  console.log("done");
}

main().catch(e => { console.error(e); process.exit(1); });
