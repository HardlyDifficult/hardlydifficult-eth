// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;


import '../utils/ChainId.sol';
import '../utils/Gas.sol';

contract UtilsMock
{
  function chainId(
  ) public pure
    returns (uint _chainId)
  {
    return ChainId.chainId();
  }

  function gasPrice(
  ) public view
    returns (uint _gasPrice)
  {
    return Gas.gasPrice();
  }

  function gasRemaining(
  ) public view
    returns (uint _gasRemaining)
  {
    return Gas.gasRemaining();
  }
}
