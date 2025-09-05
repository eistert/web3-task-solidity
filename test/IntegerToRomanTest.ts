import { expect } from "chai";
import { ethers as hardhatEthers } from "hardhat";

describe("IntegerToRoman", function () {
    let contract: any;

    beforeEach(async function () {
        const factory = await hardhatEthers.getContractFactory("IntegerToRoman");
        contract = await factory.deploy(); // deploy 返回的就是已经部署好的合约实例
        // await contract.deployed(); // ❌ 不需要这句，已经部署好了
    });

    it("should revert when out of range", async () => {
        await expect(contract.intToRoman(0)).to.be.revertedWith("out of range (1..3999)");
        await expect(contract.intToRoman(4000)).to.be.revertedWith("out of range (1..3999)");
    });

    const cases = [
        [1, "I"],
        [2, "II"],
        [3, "III"],
        [4, "IV"],
        [5, "V"],
        [6, "VI"],
        [9, "IX"],
        [10, "X"],
        [14, "XIV"],
        [19, "XIX"],
        [20, "XX"],
        [40, "XL"],
        [44, "XLIV"],
        [49, "XLIX"],
        [58, "LVIII"],              // 50 + 5 + 3
        [90, "XC"],
        [94, "XCIV"],
        [99, "XCIX"],
        [400, "CD"],
        [944, "CMXLIV"],            // 900 + 40 + 4
        [3888, "MMMDCCCLXXXVIII"],  // 3000 + 800 + 80 + 8
        [1994, "MCMXCIV"],
        [3999, "MMMCMXCIX"],
    ];

    for (const [n, s] of cases) {
        it(`${n} -> ${s}`, async () => {
            const out = await contract.intToRoman(n);
            expect(out).to.equal(s);
        });
    }
});
