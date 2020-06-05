const { truffleContract } = require("../helpers");
const wethJson = require("./weth.json");

async function getToken(web3, tokenAddress) {
  return await truffleContract.at(web3, wethJson.abi, tokenAddress);
}

module.exports = {
  mainnetAddress: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  decimals: 18,
  deploy: async (web3, from) => {
    const result = await truffleContract.new(
      web3,
      wethJson.abi,
      `0x${wethJson.bytecode.replace(/0x/, "")}`,
      from
    );

    return result;
  },
  getToken,
};
