pragma solidity ^0.5.0;

contract TestReturnValue
{
  function return42()
    public pure
    returns (uint)
  {
    return 42;
  }
}
