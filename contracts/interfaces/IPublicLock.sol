pragma solidity ^0.5.0;


// Source: https://github.com/unlock-protocol/unlock/tree/master/smart-contracts
interface IPublicLock
{
  function getHasValidKey(address _account) external view returns (bool);
  // TODO add all the other functions
}
