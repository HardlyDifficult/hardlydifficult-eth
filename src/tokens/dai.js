const { truffleContract }  = require('../helpers')
const daiJson = require("./dai.json");
const utils = require("../utils");

module.exports = {
  /**
   * @param useAntiOwner true to use a proxy contract allowing any account to call `mint`.
   */
  deploy: async (web3, from, useAntiOwner) => {
    const result = await truffleContract.new(web3, daiJson.abi, daiJson.bytecode, from, daiJson.args[0]);

    if (useAntiOwner) {
      const antiOwnerProxy = await utils.antiOwnerProxy.deploy(web3, from);
      await result.setOwner(antiOwnerProxy.address, { from });
      result.mint = async (to, amount, options) => {
        const callData = web3.eth.abi.encodeFunctionCall(
          daiJson.abi.find(e => e.name === "mint"),
          [to, amount]
        );
        await antiOwnerProxy.proxyCall(result.address, callData, options);
      };
    }

    return result;
  }
};
