pragma solidity ^0.6.0;


/**
 * @title A contract with events for emiting various data types.
 * @dev Used for debugging and should be removed before a production deploy.
 */
contract Log
{
  event LogAddress(address _data);
  event LogUint(uint _data);
  event LogBytes(bytes _data);
}
