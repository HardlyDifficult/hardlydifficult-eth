
// SPDX-License-Identifier: GPL-3.0
// Original source: https://github.com/Uniswap/uniswap-v2-periphery/blob/master/contracts/examples
// Modified to unpin solidity version and to support multiple pairs
pragma solidity ^0.8.2;

import '@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol';
import '@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol';
import '@uniswap/lib/contracts/libraries/FixedPoint.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import '@uniswap/v2-periphery/contracts/libraries/UniswapV2OracleLibrary.sol';
import './UniswapV2Library.sol';
import './IUniswapOracle.sol';

contract UniswapOracle is IUniswapOracle
{ 
  using FixedPoint for *;

  struct Observation
  {
    uint timestamp;
    uint price0Cumulative;
    uint price1Cumulative;
    FixedPoint.uq112x112 price0Average;
    FixedPoint.uq112x112 price1Average;
  }

  uint public override constant PERIOD = 24 hours;
  address public override immutable factory;
  // mapping from pair address to a list of price observations of that pair
  mapping(address => Observation) private pairObservations;
  
  constructor(
    address _factory
  ) public
  {
    factory = _factory;
  }

  /**
   * @notice Updates and stores the exchange rate
   * @dev For the first 24 hours the rate will be 0.
   */
  function update(
    address _tokenIn,
    address _tokenOut
  ) public override
  {
    address pair = UniswapV2Library.pairFor(factory, _tokenIn, _tokenOut);
    Observation storage observation = pairObservations[pair];
    (uint price0Cumulative, uint price1Cumulative, uint32 blockTimestamp) =
      UniswapV2OracleLibrary.currentCumulativePrices(address(pair));
    uint32 timeElapsed = uint32(blockTimestamp - observation.timestamp); // overflow is desired

    // ensure that at least one full period has passed since the last update
    if(timeElapsed >= PERIOD)
    {
      if(observation.price0Cumulative > 0)
      {
        // overflow is desired, casting never truncates
        // cumulative price is in (uq112x112 price * seconds) units so we simply wrap it after division by time elapsed
        observation.price0Average = FixedPoint.uq112x112(uint224((price0Cumulative - observation.price0Cumulative) / timeElapsed));
        observation.price1Average = FixedPoint.uq112x112(uint224((price1Cumulative - observation.price1Cumulative) / timeElapsed));
      }
      observation.price0Cumulative = price0Cumulative;
      observation.price1Cumulative = price1Cumulative;
      observation.timestamp = blockTimestamp;
    }
  }

  /**
   * @notice Returns the rate after `update` has been called.
   */
  function consult(
    address _tokenIn,
    uint _amountIn,
    address _tokenOut
  ) public override view
    returns (uint _amountOut)
  {
    address pair = UniswapV2Library.pairFor(factory, _tokenIn, _tokenOut);
    Observation storage observation = pairObservations[pair];
    (address token0,) = UniswapV2Library.sortTokens(_tokenIn, _tokenOut);
    if (_tokenIn == token0)
    {
      _amountOut = observation.price0Average.mul(_amountIn).decode144();
    }
    else
    {
      _amountOut = observation.price1Average.mul(_amountIn).decode144();
    }
  }
  
  /**
   * @notice Calls `update` and returns the rate in a single call
   */
  function updateAndConsult(
    address _tokenIn,
    uint _amountIn,
    address _tokenOut
  ) public override
    returns (uint _amountOut)
  {
    update(_tokenIn, _tokenOut);
    return consult(_tokenIn, _amountIn, _tokenOut);
  }
}