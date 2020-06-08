// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '../../proxies/CallContract.sol';

/**
 * @title Approve this contract to spend your ERC-20 tokens, and then
 * you can call various contracts without an additional approval step.
 */
contract ApproveAndCall
{
  using CallContract for address;

  function approveAndCall(
    address _token,
    uint _amount,
    address _contract,
    bytes memory _callData
  ) public
  {
    // First move tokens from the user into this contract
    IERC20(_token).transferFrom(msg.sender, address(this), _amount);

    // Approve spending and call the contract
    IERC20(_token).approve(_contract, _amount);
    _contract._call(_callData, 0);

    // Check for any unspent tokens, this is only applicable if the _contract is not predictable
    uint balance = IERC20(_token).balanceOf(address(this));
    if(balance > 0)
    {
      // Refund the remainder
      IERC20(_token).transfer(msg.sender, balance);
    }
  }
}
