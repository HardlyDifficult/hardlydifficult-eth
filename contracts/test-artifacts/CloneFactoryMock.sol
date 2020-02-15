pragma solidity ^0.5.0;

import '../proxies/CloneFactory.sol';
import '../proxies/Clone2Factory.sol';
import '../proxies/Clone2Probe.sol';
import '../proxies/Create2Probe.sol';


contract CloneFactoryMock is
  Clone2Probe,
  Create2Probe
{
  using CloneFactory for address;
  using Clone2Factory for address;

  event CloneCreated(address proxyAddress);

  function createClone(
    address target
  ) external
  {
    address result = target._createClone();
    emit CloneCreated(result);
  }

  function createClone2(
    address target,
    bytes12 salt
  ) external
  {
    address result = target._createClone2(salt);
    emit CloneCreated(result);
  }
}
