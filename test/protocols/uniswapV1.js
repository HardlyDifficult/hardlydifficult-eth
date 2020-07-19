const { tokens, protocols, constants } = require("../..");

contract("protocols / uniswapV1", (accounts) => {
  const protocolOwner = accounts[0];
  let uniswap;
  let sai;

  before(async () => {
    uniswap = await protocols.uniswapV1.deploy(web3, protocolOwner);
    sai = await tokens.sai.deploy(web3, protocolOwner);
  });

  it("Can create an exchange and add liquidity", async () => {
    const tx = await uniswap.createExchange(sai.address, {
      from: protocolOwner,
    });
    const exchange = await protocols.uniswapV1.getExchange(
      web3,
      tx.logs[0].args.exchange
    );
    await sai.mint(protocolOwner, "10000000000", { from: protocolOwner });
    await sai.approve(exchange.address, constants.MAX_UINT, {
      from: protocolOwner,
    });
    await exchange.addLiquidity(
      "1",
      "10000000000",
      Math.round(Date.now() / 1000) + 60,
      {
        from: protocolOwner,
        value: "10000000000",
      }
    );
  });
});
