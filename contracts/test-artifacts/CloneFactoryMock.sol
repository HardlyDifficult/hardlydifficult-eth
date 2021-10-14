// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import '../proxies/CloneFactory.sol';
import '../proxies/Clone2Factory.sol';
import '../proxies/Clone2Probe.sol';
import '../proxies/Create2Probe.sol';


contract CloneFactoryMock
{
  using CloneFactory for address;
  using Clone2Factory for address;
  using Clone2Probe for address;
  using Create2Probe for address;

  event CloneCreated(address proxyAddress);

  function createClone(
    address target
  ) external
  {
    address result = target.createClone();
    emit CloneCreated(result);
  }

  function createClone2(
    address target,
    bytes32 salt
  ) external
  {
    address result = target.createClone2(salt);
    emit CloneCreated(result);
  }

  function isAddressAvailable(
    address contractAddress
  ) public view
    returns (bool)
  {
    return contractAddress.isAddressAvailable();
  }

  function getClone2Address(
    address target,
    bytes32 salt
  ) public view
    returns (address cloneAddress)
  {
    return target.getClone2Address(salt);
  }
}
