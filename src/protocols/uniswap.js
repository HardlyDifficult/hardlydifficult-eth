const truffleContract = require("truffle-contract");
const uniswapJson = require("./uniswap.json");

module.exports = {
  deploy: async (web3, owner) => {
    // Deploy exchange template
    // Deploy factory
    // initializeFactory(template: address)
    const exchangeTemplateContract = truffleContract({
      abi: uniswapJson.exchange.abi,
      bytecode: uniswapJson.exchange.bytecode
    });
    exchangeTemplateContract.setProvider(web3.currentProvider);
    const exchangeTemplate = await exchangeTemplateContract.new({
      from: owner
    });

    const contract = truffleContract({
      abi: uniswapJson.abi,
      bytecode: uniswapJson.bytecode
    });
    contract.setProvider(web3.currentProvider);
    const factory = await contract.new({ from: owner });
    await factory.initializeFactory(exchangeTemplate.address, {
      from: owner
    });

    return factory;
  },
  getExchange: async (web3, exchangeAddress) => {
    const exchangeTemplateContract = truffleContract({
      abi: uniswapJson.exchange.abi,
      bytecode: uniswapJson.exchange.bytecode
    });
    exchangeTemplateContract.setProvider(web3.currentProvider);
    return await exchangeTemplateContract.at(exchangeAddress);
  }
};
