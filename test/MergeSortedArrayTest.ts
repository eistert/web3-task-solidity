import { expect } from "chai";
import { ethers as hardhatEthers } from "hardhat";

describe("MergeSortedArray", function () {

    let contract: any;

  beforeEach(async function () {
    const factory = await hardhatEthers.getContractFactory("MergeSortedArray");
    contract = await factory.deploy(); // deploy 返回的就是已经部署好的合约实例
    // await contract.deployed(); // ❌ 不需要这句，已经部署好了
  });
  

  // 为了断言方便，把 bigint[] 转成 number[]（用小数字避免超出安全整数）
  const toNum = (arr:readonly bigint[]) => arr.map((x) => Number(x));

  describe("mergeSortedInt", () => {
    const cases = [
      { a: [], b: [], exp: [] },
      { a: [1], b: [], exp: [1] },
      { a: [], b: [-2, 0, 7], exp: [-2, 0, 7] },
      { a: [1, 3, 5], b: [2, 4, 6], exp: [1, 2, 3, 4, 5, 6] },
      { a: [1, 2, 2, 3], b: [2, 2, 5], exp: [1, 2, 2, 2, 2, 3, 5] },
      { a: [-5, -1, 0], b: [-3, 2], exp: [-5, -3, -1, 0, 2] },
    ];

    for (const { a, b, exp } of cases) {
      it(`int: [${a}] ⨁ [${b}] -> [${exp}]`, async () => {
        const out = await contract.mergeSortedInt(a, b);
        expect(toNum(out)).to.deep.equal(exp);
      });
    }
  });

  describe("mergeSortedUint", () => {
    const cases = [
      { a: [], b: [], exp: [] },
      { a: [1], b: [], exp: [1] },
      { a: [], b: [1, 2], exp: [1, 2] },
      { a: [1, 3, 5], b: [2, 4, 6], exp: [1, 2, 3, 4, 5, 6] },
      { a: [1, 2, 2, 3], b: [2, 2, 5], exp: [1, 2, 2, 2, 2, 3, 5] },
      { a: [0, 10, 10], b: [1, 10, 12], exp: [0, 1, 10, 10, 10, 12] },
    ];

    for (const { a, b, exp } of cases) {
      it(`uint: [${a}] ⨁ [${b}] -> [${exp}]`, async () => {
        const out = await contract.mergeSortedUint(a, b);
        expect(toNum(out)).to.deep.equal(exp);
      });
    }
  });
});
