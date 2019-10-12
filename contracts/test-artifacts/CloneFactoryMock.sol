pragma solidity ^0.5.0;

import '../CloneFactory.sol';

contract CloneFactoryMock is
  CloneFactory
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
    address result = _createClone(target, salt);
    emit CloneCreated(result);
  }
}