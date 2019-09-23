const truffleContract = require("@truffle/contract");
const daiJson = require("./dai.json");
const utils = require("../utils");

module.exports = {
  /**
   * @param useAntiOwner true to use a proxy contract allowing any account to call `mint`.
   */
  deploy: async (web3, from, useAntiOwner) => {
    const contract = truffleContract({
      abi: daiJson.abi,
      bytecode: daiJson.bytecode
    });
    contract.setProvider(web3.currentProvider);
    const result = await contract.new(daiJson.args[0], { from });

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
