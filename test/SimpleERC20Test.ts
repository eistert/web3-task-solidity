import { expect } from "chai";
import { ethers } from "hardhat";

describe("SimpleERC20", () => {
    const NAME = "Demo Token"; // 代币“全名”，如 "Tether USD"
    const SYMBOL = "DMT"; // 代币“符号/简称”，如 "USDT"
    const DEC = 18; // 小数位数（decimals），常见为 18

    // 测试账户
    let token: any;
    let owner: any, alice: any, bob: any, carol: any;

    // 把“人类可读的数量”转成最小单位（bigint）
    const U = (v: string | number) => ethers.parseUnits(String(v), DEC); // to bigint

    beforeEach(async () => {
        [owner, alice, bob, carol] = await (ethers as any).getSigners();
        const F = await ethers.getContractFactory("SimpleERC20");
        token = await F.deploy(NAME, SYMBOL, DEC);
    });

    // 校验构造参数是否写入成功；
    // 断言合约的元数据
    it("metadata & initial", async () => {
        expect(await token.name()).to.equal(NAME);
        expect(await token.symbol()).to.equal(SYMBOL);
        expect(await token.decimals()).to.equal(DEC);
        expect(await token.totalSupply()).to.equal(0n);
    });

    // 只有 owner 能增发
    it("only owner can mint", async () => {
        await expect(token.connect(alice).mint(alice.address, U(1000)))
            .to.be.revertedWith("Ownable: not owner");

        await expect(token.mint(alice.address, U(1000)))
            .to.emit(token, "Transfer")
            .withArgs(ethers.ZeroAddress, alice.address, U(1000));

        expect(await token.totalSupply()).to.equal(U(1000));
        expect(await token.balanceOf(alice.address)).to.equal(U(1000));
    });



    it("transfer works", async () => {
        await token.mint(alice.address, U(1000));
        await expect(token.connect(alice).transfer(bob.address, U(200)))
            .to.emit(token, "Transfer")
            .withArgs(alice.address, bob.address, U(200));

        expect(await token.balanceOf(alice.address)).to.equal(U(800));
        expect(await token.balanceOf(bob.address)).to.equal(U(200));

        await expect(token.connect(alice).transfer(bob.address, U(9999)))
            .to.be.revertedWith("ERC20: insufficient balance");
    });

    // 授权 + 代扣 approve / transferFrom
    it("approve & transferFrom", async () => {
        await token.mint(alice.address, U(1000));

        // 授权 300 给 Bob
        await expect(token.connect(alice).approve(bob.address, U(300)))
            .to.emit(token, "Approval")
            .withArgs(alice.address, bob.address, U(300));

        // Bob 代扣 200 给 Carol
        await expect(token.connect(bob).transferFrom(alice.address, carol.address, U(200)))
            .to.emit(token, "Transfer")
            .withArgs(alice.address, carol.address, U(200));

        // allowance 减到 100
        expect(await token.allowance(alice.address, bob.address)).to.equal(U(100));

        // 允许不足时应失败
        await expect(token.connect(bob).transferFrom(alice.address, carol.address, U(200)))
            .to.be.revertedWith("ERC20: insufficient allowance");
    });

    // “无限授权”不扣减
    it("infinite allowance is not decreased", async () => {
        await token.mint(alice.address, U(100));
        const INF = (2n ** 256n) - 1n;

        await token.connect(alice).approve(bob.address, INF);
        await token.connect(bob).transferFrom(alice.address, carol.address, U(60));

        expect(await token.allowance(alice.address, bob.address)).to.equal(INF);
        expect(await token.balanceOf(carol.address)).to.equal(U(60));
    });
});
