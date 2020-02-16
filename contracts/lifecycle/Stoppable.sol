pragma solidity ^0.5.0;

import '../access/roles/AdminRole.sol';

/**
 * @notice Allows an operator (the `AdminRole`) to `stop` a contract.
 * Once it's been stopped, it cannot be started again.
 *
 * Original source: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/lifecycle/Pausable.sol
 */
contract Stoppable is AdminRole
{
  /**
   * @notice Emitted when the stop is triggered by a stopper (`account`).
   */
  event Stopped(address account);

  bool public _stopped;

  /**
   * @dev Initializes the contract in running state. Assigns the Pauser role
   * to the deployer.
   */
  constructor () internal
  {
    _stopped = false;
  }

  /**
   * @notice Returns true if the contract is stopped, and false otherwise.
   */
  function stopped() public view returns (bool)
  {
    return _stopped;
  }

  /**
   * @dev Modifier to make a function callable only when the contract is not stopped.
   */
  modifier whenNotStopped()
  {
    require(!_stopped, 'Stoppable: stopped');
    _;
  }

  /**
    * @dev Modifier to make a function callable only when the contract is stopped.
    */
  modifier whenStopped()
  {
    require(_stopped, 'Stoppable: not stopped');
    _;
  }

  /**
    * @notice Called by a stopper to stop, triggers stopped state.
    */
  function stop() public onlyAdmin whenNotStopped
  {
    _stopped = true;
    emit Stopped(msg.sender);
  }
}
