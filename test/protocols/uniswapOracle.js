const { constants, tokens, protocols } = require("../..");
const { time } = require("@openzeppelin/test-helpers");
const BigNumber = require("bignumber.js");

// This is a copy of the contracts/protocols/Uniswap test using the built json instead
// of the contract artifact.
contract("protocols / uniswapOracle", (accounts) => {
  const [trader, liquidityOwner, protocolOwner] = accounts;
  let uniswapRouter, uniswapOracle;
  let dai, weth, sai;

  before(async () => {
    dai = await tokens.dai.deploy(web3, protocolOwner);
    sai = await tokens.sai.deploy(web3, protocolOwner);
    weth = await tokens.weth.deploy(web3, protocolOwner);
    uniswapRouter = await protocols.uniswapV2.deploy(
      web3,
      protocolOwner,
      constants.ZERO_ADDRESS,
      weth.address
    );

    // Create DAI <-> WETH pool
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

    // Create SAI <-> WETH pool
    await sai.mint(liquidityOwner, web3.utils.toWei("100000", "ether"), {
      from: protocolOwner,
    });
    await sai.approve(uniswapRouter.address, constants.MAX_UINT, {
      from: liquidityOwner,
    });
    await uniswapRouter.addLiquidityETH(
      sai.address,
      web3.utils.toWei("2000", "ether"),
      "1",
      "1",
      liquidityOwner,
      constants.MAX_UINT,
      { from: liquidityOwner, value: web3.utils.toWei("10", "ether") }
    );

    uniswapOracle = await protocols.uniswapOracle.deploy(
      web3,
      protocolOwner,
      await uniswapRouter.factory()
    );

    // Advancing time to avoid an intermittent test fail
    await time.increase(time.duration.hours(1));

    // Do a swap so there is some data accumulated
    await uniswapRouter.swapExactETHForTokens(
      1,
      [weth.address, dai.address],
      trader,
      constants.MAX_UINT,
      { from: trader, value: web3.utils.toWei("1", "ether") }
    );
    await uniswapRouter.swapExactETHForTokens(
      1,
      [weth.address, sai.address],
      trader,
      constants.MAX_UINT,
      { from: trader, value: web3.utils.toWei("1", "ether") }
    );

    // Record the initial data point
    await uniswapOracle.update(weth.address, dai.address, {
      from: accounts[0],
    });
    await uniswapOracle.update(weth.address, sai.address, {
      from: accounts[0],
    });
  });

  it("The exchange rate is 0 until 24 hours have past", async () => {
    const rate = await uniswapOracle.consult(
      weth.address,
      web3.utils.toWei("1", "ether"),
      dai.address
    );
    // Get rate in DAI: ~$166
    assert.equal(web3.utils.fromWei(rate.toString(), "ether"), 0);
  });

  describe("after 24 hours", () => {
    const expectedRate = "165.334347383997288516";

    before(async () => {
      // Advance time so 1 full period has past and then update again so we have data point to read
      await time.increase(time.duration.hours(30));
    });

    it("Can read the exchange rate", async () => {
      await uniswapOracle.update(weth.address, dai.address, {
        from: accounts[0],
      });
      const rate = await uniswapOracle.consult(
        weth.address,
        web3.utils.toWei("1", "ether"),
        dai.address,
        // Testing if this fixes the CI fail
        { from: accounts[0], gas: constants.MAX_GAS }
      );
      // Get rate in DAI: ~$166
      assert.equal(
        new BigNumber(web3.utils.fromWei(rate.toString(), "ether")).toFixed(2),
        new BigNumber(expectedRate).toFixed(2)
      );
    });

    describe("onSwap", () => {
      before(async () => {
        await uniswapRouter.swapExactETHForTokens(
          1,
          [weth.address, dai.address],
          trader,
          constants.MAX_UINT,
          { from: trader, value: web3.utils.toWei("1", "ether") }
        );
      });

      it("The exchange rate does not change right away", async () => {
        // Update here is a no-op as the time period has not yet past
        await uniswapOracle.update(weth.address, dai.address, {
          from: accounts[0],
        });
        const rate = await uniswapOracle.consult(
          weth.address,
          web3.utils.toWei("1", "ether"),
          dai.address,
          {
            from: accounts[0],
          }
        );
        // Get rate in DAI
        assert.equal(
          new BigNumber(web3.utils.fromWei(rate.toString(), "ether")).toFixed(
            2
          ),
          new BigNumber(expectedRate).toFixed(2)
        );
      });

      describe("after 24 hours", () => {
        before(async () => {
          // Advance time so 1 full period has past and then update again so we have a data point to read
          await time.increase(time.duration.hours(30));
        });

        it("The exchange rate has updated", async () => {
          await uniswapOracle.update(weth.address, dai.address, {
            from: accounts[0],
          });
          const rate = await uniswapOracle.consult(
            weth.address,
            web3.utils.toWei("1", "ether"),
            dai.address,
            {
              from: accounts[0],
            }
          );
          // The rate has decreased
          assert(
            new BigNumber(
              web3.utils.fromWei(rate.toString(), "ether")
            ).isLessThan(expectedRate)
          );
        });

        it("The SAI exchange rate was not impacted", async () => {
          await uniswapOracle.update(weth.address, sai.address, {
            from: accounts[0],
          });
          const rate = await uniswapOracle.consult(
            weth.address,
            web3.utils.toWei("1", "ether"),
            sai.address,
            {
              from: accounts[0],
            }
          );
          // Get rate in SAI
          assert.equal(
            new BigNumber(web3.utils.fromWei(rate.toString(), "ether")).toFixed(
              2
            ),
            new BigNumber(expectedRate).toFixed(2)
          );
        });
      });
    });
  });
});
