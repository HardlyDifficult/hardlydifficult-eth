const truffleContract = require("@truffle/contract");
const antiOwnerProxy = require("../../build/contracts/AntiOwnerProxy.json");

module.exports = {
  deploy: async (web3, from) => {
    const contract = truffleContract({
      abi: antiOwnerProxy.abi,
      bytecode: `0x${antiOwnerProxy.bytecode.replace(/0x/,"")}`
    });
    contract.setProvider(web3.currentProvider);
    return await contract.new({ from });
  }
};
