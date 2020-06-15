const { constants, tokens, protocols } = require("../../../..");
const { time } = require("@openzeppelin/test-helpers");
const BigNumber = require("bignumber.js");
const UniswapOracleMock = artifacts.require("UniswapOracleMock");

contract("contracts / UniswapOracleMock", (accounts) => {
  const [trader, liquidityOwner, protocolOwner] = accounts;
  let uniswapRouter, uniswapOracleMock;
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

    uniswapOracleMock = await UniswapOracleMock.new(
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
    await uniswapOracleMock.update(weth.address, dai.address);
    await uniswapOracleMock.update(weth.address, sai.address);
  });

  it("The exchange rate is 0 until 24 hours have past", async () => {
    const rate = await uniswapOracleMock.consult(
      weth.address,
      web3.utils.toWei("1", "ether"),
      dai.address
    );
    assert.equal(web3.utils.fromWei(rate.toString(), "ether"), 0);

    describe("after 24 hours", () => {
      const expectedRate = "165.334347383997288516";

      before(async () => {
        // Advance time so 1 full period has past and then update again so we have data point to read
        await time.increase(time.duration.hours(30));
      });

      it("Can read the exchange rate", async () => {
        const tx = await uniswapOracleMock.updateAndConsultMock(
          weth.address,
          web3.utils.toWei("1", "ether"),
          dai.address
        );
        assert.equal(
          new BigNumber(
            web3.utils.fromWei(tx.logs[0].args.amountOut.toString(), "ether")
          ).toFixed(2),
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
          const tx = await uniswapOracleMock.updateAndConsultMock(
            weth.address,
            web3.utils.toWei("1", "ether"),
            dai.address
          );
          assert.equal(
            new BigNumber(
              web3.utils.fromWei(tx.logs[0].args.amountOut.toString(), "ether")
            ).toFixed(2),
            new BigNumber(expectedRate).toFixed(2)
          );
        });

        describe("after 24 hours", () => {
          before(async () => {
            // Advance time so 1 full period has past and then update again so we have a data point to read
            await time.increase(time.duration.hours(30));
          });

          it("The exchange rate has updated", async () => {
            const tx = await uniswapOracleMock.updateAndConsultMock(
              weth.address,
              web3.utils.toWei("1", "ether"),
              dai.address
            );
            assert(
              new BigNumber(
                web3.utils.fromWei(
                  tx.logs[0].args.amountOut.toString(),
                  "ether"
                )
              ).isLessThan(expectedRate)
            );
          });

          it("The SAI exchange rate was not impacted", async () => {
            const tx = await uniswapOracleMock.updateAndConsultMock(
              weth.address,
              web3.utils.toWei("1", "ether"),
              sai.address
            );
            // Get rate in SAI
            assert.equal(
              new BigNumber(
                web3.utils.fromWei(
                  tx.logs[0].args.amountOut.toString(),
                  "ether"
                )
              ).toFixed(2),
              new BigNumber(expectedRate).toFixed(2)
            );
          });
        });
      });
    });
  });
});
