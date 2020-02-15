pragma solidity ^0.5.0;

import '../lifecycle/Stoppable.sol';

/**
 * Original source: https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/master/contracts/mocks/PausableMock.sol
 */
contract StoppableMock is Stoppable
{
  bool public drasticMeasureTaken;
  uint public count;

  function normalProcess() external whenNotStopped
  {
    count++;
  }

  function drasticMeasure() external whenStopped
  {
    drasticMeasureTaken = true;
  }
}
