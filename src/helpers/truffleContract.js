const truffleContract = require("@truffle/contract");

module.exports = {
  at: async (web3, abi, address) => {
    const contract = truffleContract({
      abi
    });
    contract.setProvider(web3.currentProvider);
    return await contract.at(address);
  },
  new: async (web3, abi, bytecode, from, ...args) => {
    const contract = truffleContract({
      abi,
      bytecode
    });
    contract.setProvider(web3.currentProvider);
    return await contract.new(...args, { from });
  }
};
