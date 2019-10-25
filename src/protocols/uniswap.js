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
      `0x${uniswapJson.exchange.bytecode.replace(/0x/, "")}`,
      owner
    );
    const factory = await truffleContract.new(
      web3,
      uniswapJson.abi,
      `0x${uniswapJson.bytecode.replace(/0x/, "")}`,
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
