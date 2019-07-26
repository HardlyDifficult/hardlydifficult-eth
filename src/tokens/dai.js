const daiJson = require("./dai.json");
const constants = require("../constants");

module.exports = {
  deploy: async (web3, owner) => {
    return await new web3.eth.Contract(daiJson.abi)
      .deploy({
        data: daiJson.bytecode,
        arguments: daiJson.args
      })
      .send({
        from: owner,
        gas: constants.MAX_GAS
      });
  }
};
