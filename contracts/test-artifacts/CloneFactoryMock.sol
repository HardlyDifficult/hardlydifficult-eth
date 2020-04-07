pragma solidity ^0.5.0;

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
}
