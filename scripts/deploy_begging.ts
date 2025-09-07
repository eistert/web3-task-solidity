import { ethers } from "hardhat";

async function main() {
    const F = await ethers.getContractFactory("BeggingContract");
    // 不限时间窗
    const c = await F.deploy(0, 0);
    await c.waitForDeployment();
    console.log("BeggingContract:", await c.getAddress());
}
main().catch((e) => { console.error(e); process.exit(1); });
