pragma solidity ^0.5.0;

import './CallContract.sol';


/**
 * @title Anti-Owner Proxy used to bypass existing owner checks (typically for testing).
 * @notice Allows anyone to make arbitrary calls through this contract.
 * @dev If this contract is the owner / admin account for another, this contract allows
 * anyone to make owner only calls; bypassing the owner requirement.
 */
contract AntiOwnerProxy is
  CallContract
{
  function proxyCall(
    address _contract,
    bytes memory _callData
  ) public
  {
    _call(_contract, 0, _callData);
  }
}