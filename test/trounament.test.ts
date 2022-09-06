import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { defaultAbiCoder, formatEther, parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";

interface Fixture {
  token: Contract;
  tournament: Contract;
  owner: Signer;
  users: Array<Signer>;
}

export async function getFixtures (): Promise<Fixture> {
  const users = await ethers.getSigners();
  const owner = users[0];
  // token
  const Token = await ethers.getContractFactory("Token");
  const  token = await Token.deploy(parseEther("100000"));
  await token.deployed();
  // libraray
  const StringUtils = await ethers.getContractFactory("StringUtils");
  const stringUtils = await StringUtils.deploy();
  await stringUtils.deployed();
  // tournament
  const Tournament = await ethers.getContractFactory("Tournament",{
    libraries: {
      StringUtils: stringUtils.address,
    },
  });
  const tournament = await Tournament.deploy(
    token.address,
    owner.address,
    10
  );
  await tournament.deployed();
  return {
    token,
    tournament,
    owner,
    users
  }
}

describe("tournament", function () {
  let owner: Signer;
  let users: Array<Signer>;
  let token: Contract;
  let tournament: Contract;
  this.beforeEach(async () => {
    const fixtures = await getFixtures();
    token = fixtures.token;
    tournament = fixtures.tournament;
    owner = fixtures.owner;
    users = fixtures.users;
    for (let i = 1; i <= 8; i++) {
      await token.transfer(users[i].getAddress(), parseEther("100"));
    }
    // create tournament
    const start = (await ethers.provider.getBlock("latest")).timestamp;
    await tournament.setTournament(
      start,
      8,
      parseEther("100")
    );
  });
  
  it("join tournament", async () => {
    for (let i = 1; i <= 8; i++) {
      await token.connect(users[i]).approve(tournament.address, parseEther("100"));
      await tournament.connect(users[i]).join();
      const position = await tournament.position();
      expect(Number(position)).to.eq(i);
    }
  });
  it("find opponent", async () => {
    for (let i = 1; i <= 8; i++) {
      await token.connect(users[i]).approve(tournament.address, parseEther("100"));
      await tournament.connect(users[i]).join();
      const position = await tournament.position();
      expect(Number(position)).to.eq(i);
    }
    const findOpponent1 = await tournament.find(users[1].getAddress());
    expect(findOpponent1).to.eq(await users[2].getAddress());
    const findOpponent2 = await tournament.find(users[2].getAddress());
    expect(findOpponent2).to.eq(await users[1].getAddress());
  });
  it("process result", async () => {
    await tournament.setDomain("moonpool");
    for (let i = 1; i <= 8; i++) {
      await token.connect(users[i]).approve(tournament.address, parseEther("100"));
      await tournament.connect(users[i]).join();
      const position = await tournament.position();
      expect(Number(position)).to.eq(i);
    }
    const pot = await tournament.pot();
    const balance = await token.balanceOf(tournament.address);
    expect(pot).to.eq(balance);
    const player1 = await users[1].getAddress();
    const player2 = await users[2].getAddress();
    const hashData = defaultAbiCoder.encode(
      ['string', 'address', 'address'], 
      ['moonpool', player1, player2]
    );
    await tournament.connect(users[1]).processResult(hashData);
    const balance1 = await token.balanceOf(player2);
    await tournament.connect(users[2]).processResult(hashData);
    const balance2 = await token.balanceOf(player2);
    console.log(balance1, balance2)
    // const prize = await tournament.pendingPrize(player2);
    // console.log(prize);
  });
});