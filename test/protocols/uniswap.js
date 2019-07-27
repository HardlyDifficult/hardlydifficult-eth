const { constants, tokens, protocols } = require("../..");

contract("protocols / uniswap", accounts => {
  const protocolOwner = accounts[0];
  let uniswap;
  let dai;

  before(async () => {
    uniswap = await protocols.uniswap.deploy(web3, protocolOwner);
    dai = await tokens.dai.deploy(web3, protocolOwner);
  });

  it("Can create an exchange and add liquidity", async () => {
    const tx = await uniswap.methods
      .createExchange(dai._address)
      .send({ from: protocolOwner, gas: constants.MAX_GAS });
    const exchange = protocols.uniswap.getExchange(
      tx.events.NewExchange.returnValues.exchange
    );
    await dai.methods
      .mint(protocolOwner, "10000000000")
      .send({ from: protocolOwner });
    await dai.methods
      .approve(exchange._address, -1)
      .send({ from: protocolOwner });
    await exchange.methods
      .addLiquidity("1", "10000000000", Math.round(Date.now() / 1000) + 60)
      .send({
        from: protocolOwner,
        value: "10000000000",
        gas: constants.MAX_GAS
      });
  });
});
