// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Coin is ERC20 {
    constructor(uint256 initialSupply) ERC20("Coin", "COIN") {
        _mint(msg.sender, initialSupply);
    }

    function mint(uint256 amount) public {
        _mint(msg.sender, amount);
    }

    function myBalance() public view returns (uint256) {
        return balanceOf(msg.sender);
    }

    function decimals() public view virtual override returns (uint8) {
        return 0;
    }
}
