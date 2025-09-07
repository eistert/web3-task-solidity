import { expect } from "chai";
import { ethers } from "hardhat";

describe("MyNFT (OZ v5)", function () {
  const NAME = "DemoNFT";
  const SYMBOL = "DNFT";
  let nft: any;
  let owner: any, alice: any, bob: any;

  beforeEach(async () => {
    [owner, alice, bob] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("MyNFT");
    nft = await Factory.deploy(NAME, SYMBOL);
    await nft.waitForDeployment();
  });

  it("constructor sets name & symbol", async () => {
    expect(await nft.name()).to.equal(NAME);
    expect(await nft.symbol()).to.equal(SYMBOL);
  });

  it("only owner can mint", async () => {
    await expect(
      nft.connect(alice).mintNFT(alice.address, "ipfs://x")
    )
      .to.be.revertedWithCustomError(nft, "OwnableUnauthorizedAccount")
      .withArgs(alice.address);
  });

  it("mints tokenId 0 then 1 and sets tokenURI", async () => {
    const uri0 = "ipfs://bafy.../0.json";
    await expect(nft.mintNFT(alice.address, uri0))
      .to.emit(nft, "Transfer")
      .withArgs(ethers.ZeroAddress, alice.address, 0n);

    expect(await nft.ownerOf(0)).to.equal(alice.address);
    expect(await nft.tokenURI(0)).to.equal(uri0);

    const uri1 = "ipfs://bafy.../1.json";
    await expect(nft.mintNFT(bob.address, uri1))
      .to.emit(nft, "Transfer")
      .withArgs(ethers.ZeroAddress, bob.address, 1n);

    expect(await nft.ownerOf(1)).to.equal(bob.address);
    expect(await nft.tokenURI(1)).to.equal(uri1);
  });

  it("tokenURI reverts for non-existent token", async () => {
    await expect(nft.tokenURI(999999))
      .to.be.revertedWithCustomError(nft, "ERC721NonexistentToken");
  });
});
