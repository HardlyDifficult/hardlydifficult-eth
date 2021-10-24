// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;


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