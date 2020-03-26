const { truffleContract } = require("../helpers");
const uniswapJson = require("./uniswap.json");

module.exports = {
  mainnetFactoryAddress: "0xc0a47dfe034b400b47bdad5fecda2621de6c4d95",
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
      from: owner,
    });

    return factory;
  },
  getFactory: async (web3, factoryAddress) => {
    return await truffleContract.at(web3, uniswapJson.abi, factoryAddress);
  },
  getExchange: async (web3, exchangeAddress) => {
    return await truffleContract.at(
      web3,
      uniswapJson.exchange.abi,
      exchangeAddress
    );
  },
};
