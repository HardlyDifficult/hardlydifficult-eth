// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.2;


// Source: https://github.com/Uniswap/contracts-vyper/blob/master/contracts/uniswap_factory.vy
interface IUniswapFactory
{
  // Events
  event NewExchange(address indexed token, address indexed exchange);

  // Read-only
  function getExchange(address token) external view returns (address);
  function exchangeTemplate() external view returns (address);
  function tokenCount() external view returns (uint256);
  function getToken(address exchange) external view returns (address);
  function getTokenWithId(uint256 token_id) external view returns (address);

  // Transactions
  function initializeFactory(address template) external;
  function createExchange(address token) external returns (address);
}
