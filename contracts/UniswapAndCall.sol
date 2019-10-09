pragma solidity ^0.5.0;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import './interfaces/IUniswapFactory.sol';
import './interfaces/IUniswapExchange.sol';
import './CallContract.sol';

/**
 * @title Swaps tokens with Uniswap and then calls another contract and then 
 * refunds anything remaining.
 */
contract UniswapAndCall is
  CallContract
{
  IUniswapFactory public uniswapFactory;

  constructor(
    IUniswapFactory _uniswapFactory
  ) public {
    require(address(_uniswapFactory) != address(0), 'UNISWAP_ADDRESS_REQUIRED');
    uniswapFactory = _uniswapFactory;
  }

  function() external payable {}

  function uniswapEthAndCall(
    address _token,
    uint _tokenAmount,
    uint _deadline,
    address _contract,
    bytes memory _callData
  ) public payable
  {
    // Swap ether for tokens
    IUniswapExchange exchange = IUniswapExchange(uniswapFactory.getExchange(_token));
    exchange.ethToTokenSwapOutput.value(msg.value)(_tokenAmount, _deadline);

    // Approve spending and call the contract
    IERC20(_token).approve(_contract, _tokenAmount);
    _call(_contract, 0, _callData);

    // Check for any unspent tokens, this is only applicable if the _contract is not predictable
    uint balance = IERC20(_token).balanceOf(address(this));
    if(balance > 0)
    {
      uint value = exchange.getTokenToEthInputPrice(balance);
      if(value > 0) // TODO change to >= minEstimatedGas * gasPrice
      {
        // If we can get at least a wei for it, let's sell and refund the remainder
        IERC20(_token).approve(address(exchange), balance);
        exchange.tokenToEthSwapInput(balance, value, _deadline);
      }
      /**
       * At this point any tokens remaining in the contract should be worthless dust.
       *
       * It's not worth the gas to return them, so they remain here as a donation
       * to the next user.
       */
    }

    // Refund any remaining ether
    msg.sender.transfer(address(this).balance);
  }

  // TODO add support for Token -> ETH and Token -> Token swap then call
}
