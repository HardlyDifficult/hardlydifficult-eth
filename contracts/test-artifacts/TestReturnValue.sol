// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

contract TestReturnValue
{
  function return42()
    public pure
    returns (uint)
  {
    return 42;
  }
}
