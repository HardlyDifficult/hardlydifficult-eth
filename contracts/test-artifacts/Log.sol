// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;


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
