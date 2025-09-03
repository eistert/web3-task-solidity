import { expect } from "chai";
import { ethers as hardhatEthers } from "hardhat";

describe("StringReverser", function () {
  let contract: any;

  beforeEach(async function () {
    const factory = await hardhatEthers.getContractFactory("StringReverser");
    contract = await factory.deploy(); // deploy 返回的就是已经部署好的合约实例
    // await contract.deployed(); // ❌ 不需要这句，已经部署好了
  });

  it("should reverse ASCII strings correctly using reverseAscii()", async function () {
    expect(await contract.reverseAscii("abcde")).to.equal("edcba");
    expect(await contract.reverseAscii("12345")).to.equal("54321");
    expect(await contract.reverseAscii("a")).to.equal("a");
    expect(await contract.reverseAscii("")).to.equal("");
  });

  it("should reverse UTF-8 strings correctly using reverseString()", async function () {
    expect(await contract.reverseString("abcde")).to.equal("edcba");
    expect(await contract.reverseString("12345")).to.equal("54321");
    expect(await contract.reverseString("a")).to.equal("a");
    expect(await contract.reverseString("")).to.equal("");
  });
});
