const { truffleContract } = require("../helpers");
const saiJson = require("./sai.json");
const utils = require("../utils");

async function getToken(web3, tokenAddress) {
  return await truffleContract.at(web3, saiJson.abi, tokenAddress);
}

module.exports = {
  /**
   * @param useAntiOwner true to use a proxy contract allowing any account to call `mint`.
   */
  deploy: async (web3, from, useAntiOwner) => {
    const result = await truffleContract.new(
      web3,
      saiJson.abi,
      `0x${saiJson.bytecode.replace(/0x/, "")}`,
      from,
      saiJson.args[0]
    );

    if (useAntiOwner) {
      const antiOwnerProxy = await utils.antiOwnerProxy.deploy(web3, from);
      await result.setOwner(antiOwnerProxy.address, { from });
      result.mint = async (to, amount, options) => {
        const callData = web3.eth.abi.encodeFunctionCall(
          saiJson.abi.find(e => e.name === "mint"),
          [to, amount]
        );
        await antiOwnerProxy.proxyCall(result.address, callData, options);
      };
    }

    return result;
  },
  getToken
};
