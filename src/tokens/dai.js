const { truffleContract } = require("../helpers");
const daiJson = require("./dai.json");
const utils = require("../utils");

async function getToken(web3, tokenAddress) {
  return await truffleContract.at(web3, daiJson.abi, tokenAddress);
}

module.exports = {
  mainnetAddress: "0x6b175474e89094c44da98b954eedeac495271d0f",
  decimals: 18,
  /**
   * @param useAntiOwner true to use a proxy contract allowing any account to call `mint`.
   */
  deploy: async (web3, from, useAntiOwner) => {
    const result = await truffleContract.new(
      web3,
      daiJson.abi,
      `0x${daiJson.bytecode.replace(/0x/, "")}`,
      from,
      daiJson.args[0]
    );

    if (useAntiOwner) {
      const antiOwnerProxy = await utils.antiOwnerProxy.deploy(web3, from);
      await result.rely(antiOwnerProxy.address, { from });
      result.mint = async (to, amount, options) => {
        const callData = web3.eth.abi.encodeFunctionCall(
          daiJson.abi.find((e) => e.name === "mint"),
          [to, amount]
        );
        await antiOwnerProxy.proxyCall(result.address, callData, options);
      };
    }

    return result;
  },
  getToken,
};
