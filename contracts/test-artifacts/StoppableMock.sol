pragma solidity ^0.5.0;

import '@openzeppelin/upgrades/contracts/Initializable.sol';
import '../lifecycle/Stoppable.sol';

/**
 * Original source: https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/master/contracts/mocks/PausableMock.sol
 */
contract StoppableMock is Stoppable
{
  bool public drasticMeasureTaken;
  uint public count;

  function initialize() external
  {
    _initializeAdminRole(msg.sender);
  }

  function normalProcess() external whenNotStopped
  {
    count++;
  }

  function drasticMeasure() external whenStopped
  {
    drasticMeasureTaken = true;
  }
}
