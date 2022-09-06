import { expect } from "chai";
import { Contract } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";


describe("reception", function () {
  it("deposit and withdraw", async function () {
    const [owner, user, user1] = await ethers.getSigners();
    // mock token
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy(parseEther("10000"));
    await token.deployed();
    token.transfer(user.address, parseEther("5000"));
    // reception
    const Reception = await ethers.getContractFactory("Reception");
    const reception = await Reception.deploy(
      owner.address,
      token.address
    );
    await reception.deployed();

    const roomId1 = await reception.isCreatedRoom(owner.address, user.address);
    expect(roomId1).to.eq(0);
    
    //reserveRoom
    await reception.createRoom(owner.address, user.address, parseEther("100"));
    const roomId2 = await reception.isCreatedRoom(user.address, owner.address);
    expect(roomId2).to.eq(1);
    // approve token
    await token.approve(reception.address, parseEther("2000"));
    await token.connect(user).approve(reception.address, parseEther("2000"));
    await reception.userDeposit(1);
    const joinable1 = await reception.isJoinable(1);
    expect(joinable1).to.be.false;
    await reception.connect(user).userDeposit(1);
    const joinable2 = await reception.isJoinable(1);
    expect(joinable2).to.be.true;
    const balance = await token.balanceOf(reception.address);
    expect(formatEther(balance)).to.eq("180.0");

    const length = await reception.roomCounts();
    expect(length).to.eq(1);

    // decide winner
    await reception.decideWinner(1, user.address);
    const winner = await reception.getWinner(1);
    console.log(winner);
    // withdraw
    await reception.withdraw(1);
    await reception.connect(user).withdraw(1);
    const balance1 = await token.balanceOf(owner.address);
    const balance2 = await token.balanceOf(user.address);
    console.log(formatEther(balance1), formatEther(balance2));

    // check is created
    const roomId = await reception.isCreatedRoom(owner.address, user.address);
    expect(roomId).to.eq(1);
    const roomId3 = await reception.isCreatedRoom(owner.address, user1.address);
    expect(roomId3).to.eq(0);

    await reception.userDeposit(1);
    await reception.connect(user).userDeposit(1);
    // await expect(reception.withdraw(1)).to.revertedWith(
    //   "Game is not over!"
    // );
    await reception.decideWinner(1, owner.address);
    await reception.withdraw(1);
    await reception.connect(user).withdraw(1);
    const balance3 = await token.balanceOf(owner.address);
    const balance4 = await token.balanceOf(user.address);
    console.log(formatEther(balance3), formatEther(balance4));
  });
});
