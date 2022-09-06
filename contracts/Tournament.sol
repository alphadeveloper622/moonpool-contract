//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Tournament is Ownable {
  using SafeERC20 for IERC20;
  using SafeMath for uint256;
  struct Tour{
    uint256 startBlock;
    uint256 endBlock;
    uint256 inAmount;
    uint256 totalDeposit;
    address[] winners;
    uint256[] rewards;
  }

  mapping(string => Tour) public tours;
  mapping(string => mapping(address => bool)) public joined;
  IERC20 public token;
  address public devAddr;
  uint256 public devfee = 10;

  constructor (
    address _devAddr,
    IERC20 _token
  ) {
    devAddr = _devAddr;
    token = _token;
  }

  function setTour(string memory databaseId, uint256 _startBlock, uint256 _endBlock, uint256 _inAmount) public onlyOwner {
    Tour memory newTour;
    newTour.startBlock = _startBlock;
    newTour.endBlock = _endBlock;
    newTour.inAmount = _inAmount;
    tours[databaseId] = newTour;    
  }

  function setWinners(string memory databaseId, address[] memory _winners, uint256[] memory _rewards) public onlyOwner {
    tours[databaseId].winners = _winners;
    tours[databaseId].rewards = _rewards;
  }

  function withdraw(uint256 amount) public onlyOwner {
    token.safeTransfer(_msgSender(), amount);
  }

  function joinTour(string memory databaseId) public {
    require(!joined[databaseId][msg.sender], "Already joined.");
    uint256 amount = tours[databaseId].inAmount;
    if(devfee > 0) {
      token.safeTransferFrom(_msgSender(), devAddr, amount.mul(devfee).div(100));
      amount = amount.sub(amount.mul(devfee).div(100));
    }
    token.safeTransferFrom(msg.sender, address(this), amount);
    tours[databaseId].totalDeposit = tours[databaseId].totalDeposit.add(amount);
    joined[databaseId][msg.sender] = true;
  }
}