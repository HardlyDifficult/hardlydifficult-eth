pragma solidity ^0.6.0;


library ChainId
{
  function chainId(
  ) internal pure
    returns (uint _chainId)
  {
    // solium-disable-next-line
    assembly
    {
      _chainId := chainid()
    }
  }
}