import { expect } from "chai";
import { ethers } from "hardhat";

describe("Voting", function () {
  let voting: any;
  let owner: any;
  let user: any;
  const initialCandidates = ["Alice", "Bob", "Charlie"];

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    const VotingFactory = await ethers.getContractFactory("Voting");
    voting = await VotingFactory.deploy(initialCandidates);
    await voting.waitForDeployment?.();
  });

  it("should initialize with correct candidates", async function () {
    const candidates = await voting.listCandidates();
    expect([...candidates]).to.have.members(initialCandidates);
  });

  it("should allow voting for existing candidates", async function () {
    await voting.connect(user).vote("Alice");
    const count = await voting.getVotes("Alice");
    expect(count).to.equal(1);
  });

  it("should auto-add new candidate if not in initial list", async function () {
    await voting.connect(user).vote("Diana");
    const candidates = await voting.listCandidates();
    expect(candidates).to.include("Diana");

    const count = await voting.getVotes("Diana");
    expect(count).to.equal(1);
  });

  it("should count multiple votes correctly", async function () {
    await voting.connect(user).vote("Bob");
    await voting.connect(user).vote("Bob");

    const count = await voting.getVotes("Bob");
    expect(count).to.equal(2);
  });

  it("should reset votes only by owner", async function () {
    await voting.connect(user).vote("Alice");
    await voting.connect(user).vote("Bob");

    await expect(voting.connect(user).resetVotes()).to.be.revertedWith("Not owner");

    await voting.connect(owner).resetVotes();

    const aliceVotes = await voting.getVotes("Alice");
    const bobVotes = await voting.getVotes("Bob");

    expect(aliceVotes).to.equal(0);
    expect(bobVotes).to.equal(0);
  });

  it("should emit events on vote and reset", async function () {
    await expect(voting.connect(user).vote("Charlie"))
      .to.emit(voting, "Voted")
      .withArgs(user.address, "Charlie", 1);

    await expect(voting.connect(owner).resetVotes())
      .to.emit(voting, "VotesReset")
      .withArgs(owner.address);
  });
});
