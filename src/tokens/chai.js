const { truffleContract } = require("../helpers");
const chaiJson = require("./chai.json");

async function getToken(web3, tokenAddress) {
  return await truffleContract.at(web3, chaiJson.abi, tokenAddress);
}

module.exports = {
  mainnetAddress: "0x06af07097c9eeb7fd685c692751d5c66db49c215",
  decimals: 18,
  deploy: async (web3, from) => {
    const result = await truffleContract.new(
      web3,
      chaiJson.abi,
      `0x${chaiJson.bytecode.replace(/0x/, "")}`,
      from,
      []
    );

    return result;
  },
  getToken,
};
