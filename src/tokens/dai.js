const truffleContract = require("truffle-contract");
const daiJson = require("./dai.json");

module.exports = {
  deploy: async (web3, owner) => {
    const contract = truffleContract({
      abi: daiJson.abi,
      bytecode: daiJson.bytecode
    });
    contract.setProvider(web3.currentProvider);
    return await contract.new(daiJson.args[0], { from: owner });
  }
};
