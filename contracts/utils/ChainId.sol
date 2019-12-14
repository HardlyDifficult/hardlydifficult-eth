pragma solidity ^0.5.0;


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