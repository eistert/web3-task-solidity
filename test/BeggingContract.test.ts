import { expect } from "chai";
import { ethers } from "hardhat";

// 便捷常量：1 ETH，2 ETH（bigint）
const ONE = ethers.parseEther("1");
const TWO = ethers.parseEther("2");

async function deploy(openNow = true) {
    const [owner, a, b, c, d] = await ethers.getSigners();

    const now = Math.floor(Date.now() / 1000);
    const start = openNow ? BigInt(now - 3600) : 0n;   // 开始于1小时前
    const end = openNow ? BigInt(now + 86400) : 0n;  // 结束于1天后

    const F = await ethers.getContractFactory("BeggingContract");
    let contract: any;

    contract = await F.deploy(start, end);

    await contract.waitForDeployment();

    return { contract, owner, a, b, c, d };
}

/**
 * 从交易回执中取得**单价**（ethers v6 没有 effectiveGasPrice 字段）
 * - 优先 rcpt.gasPrice
 * - 退化到 tx.gasPrice
 * - 最后兼容旧名 rcpt.effectiveGasPrice
 */
function getGasPriceCompat(rcpt: any, tx: any): bigint {
    const price =
        (rcpt as any).gasPrice ??
        (tx as any).gasPrice ??
        (rcpt as any).effectiveGasPrice ??
        0n;
    return BigInt(price);
}

describe("BeggingContract", () => {
    
    it("records donation via donate()", async () => {
        const { contract, a } = await deploy();

        const before = await ethers.provider.getBalance(await contract.getAddress());

        await expect(contract.connect(a).donate({ value: ONE }))
            .to.emit(contract, "Donation"); // 如果你的事件带参数，可追加 withArgs(a.address, ONE, "donate") 等

        const after = await ethers.provider.getBalance(await contract.getAddress());
        expect(after - before).to.equal(ONE);

        const rec = await contract.getDonation(a.address);
        expect(rec).to.equal(ONE);

        const total = await contract.totalRaised?.();
        if (typeof total !== "undefined") {
            expect(total).to.equal(ONE);
        }
    });

    it("records donation via plain transfer (receive)", async () => {
        const { contract, b } = await deploy();

        const contractAddr = await contract.getAddress();
        const before = await ethers.provider.getBalance(contractAddr);

        // 直接转账到合约地址，触发 receive()
        await expect(
            b.sendTransaction({ to: contractAddr, value: TWO })
        ).to.emit(contract, "Donation");

        const after = await ethers.provider.getBalance(contractAddr);
        expect(after - before).to.equal(TWO);

        const rec = await contract.getDonation(b.address);
        expect(rec).to.equal(TWO);

        const total = await contract.totalRaised?.();
        if (typeof total !== "undefined") {
            expect(total).to.equal(TWO);
        }
    });

    it("only owner can withdraw(), and owner receives full contract balance minus gas", async () => {
        const { contract, owner, a } = await deploy();

        // 存一些钱到合约
        await contract.connect(a).donate({ value: ONE });

        const contractAddr = await contract.getAddress();
        const contractBal = await ethers.provider.getBalance(contractAddr);
        expect(contractBal).to.equal(ONE);

        const ownerBefore = await ethers.provider.getBalance(owner.address);

        // 提现
        const tx = await contract.connect(owner).withdraw();
        const rcpt = await tx.wait();
        if (!rcpt) throw new Error("no receipt");

        const gasPrice = getGasPriceCompat(rcpt, tx);
        const gasFee = rcpt.gasUsed * gasPrice;

        const ownerAfter = await ethers.provider.getBalance(owner.address);
        const contractAfter = await ethers.provider.getBalance(contractAddr);

        expect(contractAfter).to.equal(0n);
        // ownerAfter = ownerBefore + contractBal - gasFee
        expect(ownerAfter).to.equal(ownerBefore + contractBal - gasFee);
    });

    it("non-owner cannot withdraw()", async () => {
        const { contract, a } = await deploy();

        await contract.connect(a).donate({ value: ONE });

        // 这里不强求具体错误文案，任何 revert 即可
        await expect(contract.connect(a).withdraw()).to.be.reverted;
    });

    it("accumulates donations from multiple donors correctly", async () => {
        const { contract, a, b, c } = await deploy();

        await contract.connect(a).donate({ value: ONE });
        await contract.connect(b).donate({ value: ONE });
        await contract.connect(c).donate({ value: TWO });

        expect(await contract.getDonation(a.address)).to.equal(ONE);
        expect(await contract.getDonation(b.address)).to.equal(ONE);
        expect(await contract.getDonation(c.address)).to.equal(TWO);

        const total = await contract.totalRaised?.();
        if (typeof total !== "undefined") {
            expect(total).to.equal(ONE + ONE + TWO);
        }

        const contractBal = await ethers.provider.getBalance(
            await contract.getAddress()
        );
        expect(contractBal).to.equal(ONE + ONE + TWO);
    });
});
