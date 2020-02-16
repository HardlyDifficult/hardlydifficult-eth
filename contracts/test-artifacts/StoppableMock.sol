pragma solidity ^0.5.0;

import '@openzeppelin/upgrades/contracts/Initializable.sol';
import '../lifecycle/Stoppable.sol';

/**
 * Original source: https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/master/contracts/mocks/PausableMock.sol
 */
contract StoppableMock is Initializable, Stoppable
{
  bool public drasticMeasureTaken;
  uint public count;

  function initialize() public initializer()
  {
    _initializeAdminRole();
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
