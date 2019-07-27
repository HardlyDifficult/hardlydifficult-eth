const uniswapJson = require("./uniswap.json");
const constants = require("../constants");

module.exports = {
  deploy: async (web3, owner) => {
    // Deploy exchange template
    // Deploy factory
    // initializeFactory(template: address)
    const exchangeTemplate = await new web3.eth.Contract(
      uniswapJson.exchange.abi
    )
      .deploy({
        data: uniswapJson.exchange.bytecode
      })
      .send({
        from: owner,
        gas: constants.MAX_GAS
      });
    const factory = await new web3.eth.Contract(uniswapJson.abi)
      .deploy({
        data: uniswapJson.bytecode
      })
      .send({
        from: owner,
        gas: constants.MAX_GAS
      });
    await factory.methods.initializeFactory(exchangeTemplate._address).send({
      from: owner,
      gas: constants.MAX_GAS
    });

    return factory;
  },
  getExchange: exchangeAddress => {
    return new web3.eth.Contract(uniswapJson.exchange.abi, exchangeAddress);
  }
};
