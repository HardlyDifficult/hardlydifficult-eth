// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;


// https://github.com/OpenZeppelin/openzeppelin-sdk/blob/master/packages/lib/contracts/upgradeability/ProxyFactory.sol
library Create2Probe
{
  function isAddressAvailable(
    address contractAddress
  ) internal view
    returns (bool)
  {
    if(contractAddress == address(0))
    {
      return false;
    }
    uint size;
    // solium-disable-next-line
    assembly
    {
      size := extcodesize(contractAddress)
    }

    return size == 0;
  }
}
