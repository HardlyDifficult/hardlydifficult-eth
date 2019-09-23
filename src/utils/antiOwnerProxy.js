const truffleContract = require("@truffle/contract");
const antiOwnerProxy = require("../../build/contracts/AntiOwnerProxy.json");

module.exports = {
  deploy: async (web3, from) => {
    const contract = truffleContract({
      abi: antiOwnerProxy.abi,
      bytecode: antiOwnerProxy.bytecode
    });
    contract.setProvider(web3.currentProvider);
    return await contract.new({ from });
  }
};
