import { expect } from "chai";
import { ethers as hardhatEthers } from "hardhat";

describe("RomanToInteger", function () {
  let contract: any;

  beforeEach(async function () {
    const factory = await hardhatEthers.getContractFactory("RomanToInteger");
    contract = await factory.deploy(); // deploy 返回的就是已经部署好的合约实例
    // await contract.deployed(); // ❌ 不需要这句，已经部署好了
  });

  it("should revert on empty string", async () => {
    await expect(contract.romanToInt("")).to.be.revertedWith("empty");
  });

    const cases = [
    ["I", 1n],
    ["III", 3n],
    ["IV", 4n],
    ["IX", 9n],
    ["XL", 40n],
    ["XC", 90n],
    ["CD", 400n],
    ["CM", 900n],
    ["LVIII", 58n],      // 50 + 5 + 3
    ["MCMXCIV", 1994n],  // 1000 + (1000-100) + (100-10) + (5-1)
    ["MMXXV", 2025n],
    ["XIV", 14n],
    ["XX", 20n],
  ];

    for (const [romanStr, value] of cases) {
    it(`romanToInt("${romanStr}") = ${value}`, async () => {
      const out = await contract.romanToInt(romanStr);
      expect(out).to.equal(value);
    });
  }

  it("returns 0 for completely invalid characters", async () => {
    // 'A' 映射为 0
    const out = await contract.romanToInt("A");
    expect(out).to.equal(0n);
  });

  it("mix of valid and invalid -> invalid字节按0处理", async () => {
    // "MXA" => M(1000) + X(10) + A(0) = 1010
    const out = await contract.romanToInt("MXA");
    expect(out).to.equal(1010n);
  });

  it("lowercase is NOT supported in current implementation", async () => {
    // 你的 getValue 仅识别大写；'i','v' 都是 0 → 结果为 0
    const out = await contract.romanToInt("iv");
    expect(out).to.equal(0n);
  });



});
