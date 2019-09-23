const { truffleContract } = require("../helpers");
const uniswapJson = require("./uniswap.json");

module.exports = {
  deploy: async (web3, owner) => {
    // Deploy exchange template
    // Deploy factory
    // initializeFactory(template: address)
    const exchangeTemplate = await truffleContract.new(
      web3,
      uniswapJson.exchange.abi,
      uniswapJson.exchange.bytecode,
      owner
    );
    const factory = await truffleContract.new(
      web3,
      uniswapJson.abi,
      uniswapJson.bytecode,
      owner
    );
    await factory.initializeFactory(exchangeTemplate.address, {
      from: owner
    });

    return factory;
  },
  getExchange: async (web3, exchangeAddress) => {
    return await truffleContract.at(
      web3,
      uniswapJson.exchange.abi,
      exchangeAddress
    );
  }
};
