pragma solidity ^0.6.0;


library Gas
{
  function gasPrice(
  ) internal view
    returns (uint _gasPrice)
  {
    // solium-disable-next-line
    assembly
    {
      _gasPrice := gasprice()
    }
  }

  function gasRemaining(
  ) internal view
    returns (uint _gasRemaining)
  {
    // solium-disable-next-line
    assembly
    {
      _gasRemaining := gas()
    }
  }
}