pragma solidity ^0.5.0;


import '@openzeppelin/contracts/math/SafeMath.sol';

library Sqrt
{
  using SafeMath for uint;

  /// @notice The max possible value
  uint256 constant MAX_UINT = 2**256 - 1;

  /**
   * @notice Calculates sqrt(x/(10^18)^2)*10^18 with 10 decimals of precision.
   * @dev Assumes 18 decimals (standard for tokens). 10 decimals of precision was choosen to
   * be on-par with the Vyper implementation.
   * Returns 0 when x < 10^26.
   */
  function sqrtOfTokens(
    uint x
  ) public pure
    returns (uint y)
  {
    // Shift by 18 decimals squared, and leave 10 decimals for sqrt precision
    y = x / 10**(18 + 18 - 10);
    y = sqrt(y);
    // Adjust for sqrt(10^10) (5) and *10^18
    y = y.mul(10**(18-5));
  }

  // Source: https://github.com/ethereum/dapp-bin/pull/50
  function sqrt(
    uint x
  ) public pure
    returns (uint y)
  {
    if (x == 0)
    {
      return 0;
    }
    else if (x <= 3)
    {
      return 1;
    }
    else if (x == MAX_UINT)
    {
      // Without this we fail on x + 1 below
      return 340282366920938463463374607431768211455;
    }

    uint z = (x + 1) / 2;
    y = x;
    while (z < y)
    {
      y = z;
      z = (x / z + z) / 2;
    }
  }
}