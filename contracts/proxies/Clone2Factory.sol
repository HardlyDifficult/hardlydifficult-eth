pragma solidity ^0.5.0;


// From https://github.com/optionality/clone-factory/blob/master/contracts/CloneFactory.sol
// Updated to support Solidity 5, switch to `create2` and revert on fail
contract Clone2Factory
{
  /**
   * @notice Uses create2 to deploy a clone to a pre-determined address.
   * @param target the address of the template contract, containing the logic for this contract.
   * @param salt a random salt used to determine the contract address before the transaction is mined.
   * @return proxyAddress the address of the newly deployed contract.
   * @dev Using `bytes12` for the salt saves 6 gas over using `uint96` (requires another shift).
   * WARNING: if the salt has already been used this will consume all available gas in the transaction.
   * You could avoid this by first checking availablility with `Clone2Probe`.
   */
  function _createClone2(
    address target,
    bytes12 salt
  ) internal
    returns (address proxyAddress)
  {
    // solium-disable-next-line
    assembly
    {
      let pointer := mload(0x40)

      // Create the bytecode for deployment based on the Minimal Proxy Standard (EIP-1167)
      mstore(pointer, 0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000)
      mstore(add(pointer, 0x14), shl(96, target))
      mstore(add(pointer, 0x28), 0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000)

      // The salt to use with the create2 call is `msg.sender+salt`
      // this prevents at attacker from front-running another user's deployment
      mstore(add(pointer, 0x40), shl(96, caller))
      mstore(add(pointer, 0x54), salt)

      // Deploy the contract, returning the address or 0 on fail
      proxyAddress := create2(0, pointer, 0x37, mload(add(pointer, 0x40)))
    }

    // Revert if the deployment fails (possible if salt was already used)
    require(proxyAddress != address(0), 'PROXY_DEPLOY_FAILED');
  }
}
