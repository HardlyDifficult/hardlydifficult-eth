pragma solidity ^0.5.0;


// From https://github.com/optionality/clone-factory/blob/master/contracts/CloneFactory.sol
// Updated to support Solidity 5 and add a `create2` option
contract CloneFactory
{
  /**
   * @notice Uses create to deploy a clone to a nonce-based address.
   * @param target the address of the template contract, containing the logic for this contract.
   * @return result the address of the newly deployed contract.
   */
  function _createClone(
    address target
  ) internal
    returns (address result)
  {
    bytes20 targetBytes = bytes20(target);
    // solium-disable-next-line
    assembly
    {
      let clone := mload(0x40)
      mstore(clone, 0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000)
      mstore(add(clone, 0x14), targetBytes)
      mstore(add(clone, 0x28), 0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000)
      result := create(0, clone, 0x37)
    }
  }

  /**
   * @notice Uses create2 to deploy a clone to a pre-determined address.
   * @param target the address of the template contract, containing the logic for this contract.
   * @param salt a random salt used to determine the contract address before the transaction is mined.
   * @return result the address of the newly deployed contract.
   */
  function _createClone(
    address target,
    uint salt
  ) internal
    returns (address result)
  {
    bytes20 targetBytes = bytes20(target);
    // solium-disable-next-line
    assembly
    {
      let clone := mload(0x40)
      mstore(clone, 0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000)
      mstore(add(clone, 0x14), targetBytes)
      mstore(add(clone, 0x28), 0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000)
      result := create2(0, clone, 0x37, salt)
    }

    // Revert if the deployment fails (possible if salt was already used)
    require(result != address(0), 'PROXY_DEPLOY_FAILED');
  }
}
