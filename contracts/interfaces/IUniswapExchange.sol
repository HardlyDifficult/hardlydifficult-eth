pragma solidity ^0.5.0;


// Source: https://github.com/Uniswap/contracts-vyper/blob/master/contracts/uniswap_exchange.vy
// The fallback function is payable and calls `ethToTokenInput`
interface IUniswapExchange
{
  // Events
  event AddLiquidity(address indexed provider, uint indexed eth_amount, uint indexed token_amount);
  event Approval(address indexed _owner, address indexed _spender, uint _value);
  event EthPurchase(address indexed buyer, uint indexed tokens_sold, uint eth_bought);
  event RemoveLiquidity(address indexed provider, uint indexed eth_amount, uint indexed token_amount);
  event TokenPurchase(address indexed buyer, uint indexed eth_sold, uint indexed tokens_bought);
  event Transfer(address indexed _from, address indexed _to, uint _value);

  // Read-only
  function allowance(address _owner, address _spender) external view returns(uint);
  function balanceOf(address _owner) external view returns(uint);
  function decimals() external view returns(uint);
  function factoryAddress() external view returns(address);
  function getEthToTokenInputPrice(uint eth_sold) external view returns(uint);
  function getEthToTokenOutputPrice(uint tokens_bought) external view returns(uint);
  function getTokenToEthInputPrice(uint tokens_sold) external view returns(uint);
  function getTokenToEthOutputPrice(uint eth_bought) external view returns(uint);
  function name() external view returns (bytes32);
  function symbol() external view returns (bytes32);
  function tokenAddress() external view returns(address);
  function totalSupply() external view returns(uint);

  // Transactions
  function setup(
    address token_addr
  ) external;
  function addLiquidity(
    uint min_liquidity, uint max_tokens, uint deadline
  ) external payable returns (uint);
  function removeLiquidity(
    uint amount, uint min_eth, uint min_tokens, uint deadline
  ) external returns (uint, uint);
  function ethToTokenSwapInput(
    uint min_tokens, uint deadline
  ) external payable returns (uint);
  function ethToTokenTransferInput(
    uint min_tokens, uint deadline, address recipient
  ) external payable returns(uint);
  function ethToTokenSwapOutput(
    uint tokens_bought, uint deadline
  ) external payable returns(uint);
  function ethToTokenTransferOutput(
    uint tokens_bought, uint deadline, address recipient
  ) external payable returns(uint);
  function tokenToEthSwapInput(
    uint tokens_sold, uint min_eth, uint deadline
  ) external returns(uint);
  function tokenToEthTransferInput(
    uint tokens_sold, uint min_eth, uint deadline, address recipient
  ) external returns(uint);
  function tokenToEthSwapOutput(
    uint eth_bought, uint max_tokens, uint deadline
  ) external returns(uint);
  function tokenToEthTransferOutput(
    uint eth_bought, uint max_tokens, uint deadline, address recipient
  ) external returns(uint);
  function tokenToTokenSwapInput(
    uint tokens_sold, uint min_tokens_bought, uint min_eth_bought, uint deadline, address token_addr
  ) external returns(uint);
  function tokenToTokenTransferInput(
    uint tokens_sold, uint min_tokens_bought, uint min_eth_bought, uint deadline, address recipient, address token_addr
  ) external returns(uint);
  function tokenToTokenSwapOutput(
    uint tokens_bought, uint max_tokens_sold, uint max_eth_sold, uint deadline, address token_addr
  ) external returns(uint);
  function tokenToTokenTransferOutput(
    uint tokens_bought, uint max_tokens_sold, uint max_eth_sold, uint deadline, address recipient, address token_addr
  ) external returns(uint);
  function tokenToExchangeSwapInput(
    uint tokens_sold, uint min_tokens_bought, uint min_eth_bought, uint deadline, address exchange_addr
  ) external returns(uint);
  function tokenToExchangeTransferInput(
    uint tokens_sold, uint min_tokens_bought, uint min_eth_bought, uint deadline, address recipient, address exchange_addr
  ) external returns(uint);
  function tokenToExchangeSwapOutput(
    uint tokens_bought, uint max_tokens_sold, uint max_eth_sold, uint deadline, address exchange_addr
  ) external returns(uint);
  function tokenToExchangeTransferOutput(
    uint tokens_bought, uint max_tokens_sold, uint max_eth_sold, uint deadline, address recipient, address exchange_addr
  ) external returns(uint);
  function transfer(
    address _to, uint _value
  ) external returns(bool);
  function transferFrom(
    address _from, address _to, uint _value
  ) external returns(bool);
  function approve(
    address _spender, uint _value
  ) external returns(bool);
}