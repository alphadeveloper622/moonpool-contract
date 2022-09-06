//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    mapping (address => uint256) updateTime;
    constructor(uint256 initialSupply) ERC20("Esports Token", "ESPT") {
        _mint(msg.sender, initialSupply);
    }
}