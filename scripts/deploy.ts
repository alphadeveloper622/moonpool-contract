// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import { formatEther, parseEther } from "ethers/lib/utils";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const [owner, user] = await ethers.getSigners();
  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy(parseEther("10000000000"));
  await token.deployed();
  console.log("token: ", token.address);

  // reception
  const Reception = await ethers.getContractFactory("Reception");
  const reception = await Reception.deploy(
    owner.address,
    token.address
  );
  await reception.deployed();
  console.log("reception: ", reception.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// Rinkedby

// token:  0x78Ac2cA7C83D5827B0685651B24b14C09643726f
// reception:  0x1a512E2c720477eb87020685F279F40327FAd61C

