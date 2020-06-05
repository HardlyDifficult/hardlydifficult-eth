const { constants, tokens, protocols } = require("../..");

contract("protocols / uniswapV2", (accounts) => {
  const protocolOwner = accounts[9];
  let uniswapRouter;
  let dai, weth;

  beforeEach(async () => {
    dai = await tokens.dai.deploy(web3, protocolOwner);
    weth = await tokens.weth.deploy(web3, protocolOwner);
    uniswapRouter = await protocols.uniswapV2.deploy(
      web3,
      protocolOwner,
      constants.ZERO_ADDRESS,
      weth.address
    );
  });

  describe("create a pair", () => {
    const liquidityOwner = accounts[1];

    beforeEach(async () => {
      await dai.mint(liquidityOwner, web3.utils.toWei("100000", "ether"), {
        from: protocolOwner,
      });
      await dai.approve(uniswapRouter.address, constants.MAX_UINT, {
        from: liquidityOwner,
      });
      await uniswapRouter.addLiquidityETH(
        dai.address,
        web3.utils.toWei("2000", "ether"),
        "1",
        "1",
        liquidityOwner,
        constants.MAX_UINT,
        { from: liquidityOwner, value: web3.utils.toWei("10", "ether") }
      );
    });

    it("can read exchange rate", async () => {
      const rate = (
        await uniswapRouter.getAmountsOut(web3.utils.toWei("1", "ether"), [
          dai.address,
          weth.address,
        ])
      )[1];
      // 1 DAI is worth ~0.004 ETH
      assert.equal(rate.toString(), "4982516215666490");
    });

    describe("swap tokens", () => {
      const trader = accounts[2];

      beforeEach(async () => {
        await uniswapRouter.swapExactETHForTokens(
          1,
          [weth.address, dai.address],
          trader,
          constants.MAX_UINT,
          { from: trader, value: web3.utils.toWei("1", "ether") }
        );
      });

      it("got dai from the swap", async () => {
        const balance = await dai.balanceOf(trader);
        // 1 ETH is worth ~180 DAI
        assert.equal(balance.toString(), "181322178776029826316");
      });
    });
  });
});
