pragma solidity ^0.5.0;

import '../proxies/CloneFactory.sol';
import '../proxies/Clone2Factory.sol';


contract CloneFactoryMock is
  CloneFactory,
  Clone2Factory
{
  event CloneCreated(address proxyAddress);

  function createClone(
    address target
  ) external
  {
    address result = _createClone(target);
    emit CloneCreated(result);
  }

  function createClone2(
    address target,
    uint salt
  ) external
  {
    address result = _createClone2(target, salt);
    emit CloneCreated(result);
  }
}