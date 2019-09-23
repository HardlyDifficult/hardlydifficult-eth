pragma solidity ^0.5.0;


/**
 * @title Anti-Owner Proxy used to bypass existing owner checks (typically for testing).
 * @notice Allows anyone to make arbitrary calls through this contract.
 * @dev If this contract is the owner / admin account for another, this contract allows
 * anyone to make owner only calls; bypassing the owner requirement.
 */
contract AntiOwnerProxy
{
  function proxyCall(
    address _contract,
    bytes memory _callData
  ) public payable
  {
    bool result;
    assembly {
      result := call(
        gas,
        _contract,
        callvalue,
        add(_callData, 32),
        mload(_callData),
        mload(0x40),
        0
      )
    }
    require(result, 'TX_FAILED');
  }
}