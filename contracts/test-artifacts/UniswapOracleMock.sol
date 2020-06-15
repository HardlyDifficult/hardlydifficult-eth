// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;


import '../protocols/Uniswap/UniswapOracle.sol';

/**
 * @title Used for testing only.
 */
contract UniswapOracleMock is UniswapOracle
{
  event ExchangeRate(uint amountOut);

  constructor(
    address _factory
  ) public
    UniswapOracle(_factory)
  {}

  function updateAndConsultMock(
    address _tokenIn,
    uint _amountIn,
    address _tokenOut
  ) public
  {
    uint amountOut = updateAndConsult(_tokenIn, _amountIn, _tokenOut);
    // Log the return value so we can test
    emit ExchangeRate(amountOut);
  }
}
