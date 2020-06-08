// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

contract TestReturnValue
{
  function return42()
    public pure
    returns (uint)
  {
    return 42;
  }
}
