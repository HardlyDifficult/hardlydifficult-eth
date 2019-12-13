pragma solidity ^0.5.0;

import '../proxies/CallContract.sol';


/**
 * @title For testing only.
 */
contract CallContractMock
{
  using CallContract for address;

  function call(
    address _contract,
    bytes memory _callData
  ) public payable
  {
    _contract._call(msg.value, _callData);
  }
}