pragma solidity ^0.5.0;

import '@openzeppelin/contracts-ethereum-package/contracts/access/Roles.sol';

/**
 * @title AdminRole
 * @notice A copy of one of the OpenZeppelin roles with a more general purpose name.
 * Original source: https://github.com/OpenZeppelin/openzeppelin-contracts/tree/master/contracts/access
 */
contract AdminRole
{
  using Roles for Roles.Role;

  event AdminAdded(address indexed account);
  event AdminRemoved(address indexed account);

  Roles.Role private _admins;

  function _initializeAdminRole() internal
  {
    _addAdmin(msg.sender);
  }

  modifier onlyAdmin()
  {
    require(isAdmin(msg.sender), 'AdminRole: caller does not have the Admin role');
    _;
  }

  function isAdmin(address account) public view returns (bool)
  {
    return _admins.has(account);
  }

  function addAdmin(address account) public onlyAdmin
  {
    _addAdmin(account);
  }

  function renounceAdmin() public
  {
    _removeAdmin(msg.sender);
  }

  function _addAdmin(address account) internal
  {
    _admins.add(account);
    emit AdminAdded(account);
  }

  function _removeAdmin(address account) internal
  {
    _admins.remove(account);
    emit AdminRemoved(account);
  }
}
