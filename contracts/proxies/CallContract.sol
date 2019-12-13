pragma solidity ^0.5.0;

/**
 * @title Calls an arbitrary contract function.
 */
library CallContract
{
  function _call(
    address _contract,
    uint _value,
    bytes memory _callData
  ) internal
  {
    bool result;
    // solium-disable-next-line
    assembly
    {
      result := call(
        gas,
        _contract,
        _value,
        add(_callData, 32),
        mload(_callData),
        mload(0x40),
        0
      )
    }
    require(result, 'INTERNAL_CONTRACT_CALL_FAILED');
  }
}