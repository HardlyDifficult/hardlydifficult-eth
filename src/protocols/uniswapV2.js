const { truffleContract } = require("../helpers");
const uniswapJson = require("./uniswapV2.json");

module.exports = {
  mainnetFactoryAddress: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
  mainnetRouterAddress: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
  /**
   * Deploys the Uniswap factory and router.
   * @param feeSetter allows a fee to be enabled. May be address(0)
   * @param wethAddress the address of the WETH token (used by the router)
   * @returns the Uniswap router as a truffleContract object
   * This is useful for testing on Ganache
   */
  deploy: async (web3, owner, feeSetter, wethAddress) => {
    const factory = await truffleContract.new(
      web3,
      uniswapJson.abi,
      `0x${uniswapJson.bytecode.replace(/0x/, "")}`,
      owner,
      feeSetter
    );

    const router = await truffleContract.new(
      web3,
      uniswapJson.router.abi,
      `0x${uniswapJson.router.bytecode.replace(/0x/, "")}`,
      owner,
      factory.address,
      wethAddress
    );

    return router;
  },
  getFactory: async (web3, factoryAddress) => {
    return await truffleContract.at(web3, uniswapJson.abi, factoryAddress);
  },
  getRouter: async (web3, routerAddress) => {
    return await truffleContract.at(
      web3,
      uniswapJson.router.abi,
      routerAddress
    );
  },
  getPair: async (web3, pairAddress) => {
    return await truffleContract.at(web3, uniswapJson.pair.abi, pairAddress);
  },
};
