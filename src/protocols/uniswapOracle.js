const { truffleContract } = require("../helpers");
const uniswapOracleJson = require("../../build/contracts/UniswapOracle.json");

module.exports = {
  /**
   * Deploys a Uniswap oracle.
   * @param uniswapFactory the uniswap factory address
   * @returns the Uniswap oracle as a truffleContract object
   */
  deploy: async (web3, owner, uniswapFactory) => {
    const oracle = await truffleContract.new(
      web3,
      uniswapOracleJson.abi,
      uniswapOracleJson.bytecode,
      owner,
      uniswapFactory
    );

    return oracle;
  },
  getOracle: async (web3, oracleAddress) => {
    return await truffleContract.at(web3, uniswapOracleJson.abi, oracleAddress);
  },
};
