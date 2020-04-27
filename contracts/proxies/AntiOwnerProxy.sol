pragma solidity ^0.6.0;

import './CallContract.sol';


/**
 * @title Anti-Owner Proxy used to bypass existing owner checks (typically for testing).
 * @notice Allows anyone to make arbitrary calls through this contract.
 * @dev If this contract is the owner / admin account for another, this contract allows
 * anyone to make owner only calls; bypassing the owner requirement.
 */
contract AntiOwnerProxy
{
  using CallContract for address;

  function proxyCall(
    address _contract,
    bytes memory _callData
  ) public
  {
    _contract._call(_callData, 0);
  }
}
