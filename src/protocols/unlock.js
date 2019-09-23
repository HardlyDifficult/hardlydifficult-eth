const truffleContract = require("@truffle/contract");
const unlockAbi = require("unlock-abi-1-1");
const unlockJson = require("./unlock.json");
const constants = require("../constants");

module.exports = {
  deploy: async (web3, owner) => {
    // Deploy contract
    // Deploy proxy(address _implementation)
    // Deploy proxyAdmin
    // proxy.initialize(address _owner)
    const unlockContract = await new web3.eth.Contract(unlockAbi.Unlock.abi)
      .deploy({
        data: unlockAbi.Unlock.bytecode
      })
      .send({
        from: owner,
        gas: constants.MAX_GAS
      });
    const proxyAdmin = await new web3.eth.Contract(unlockJson.proxyAdmin.abi)
      .deploy({
        data: unlockJson.proxyAdmin.bytecode
      })
      .send({
        from: owner,
        gas: constants.MAX_GAS
      });
    const proxy = await new web3.eth.Contract(unlockJson.proxy.abi)
      .deploy({
        data: unlockJson.proxy.bytecode,
        arguments: [unlockContract._address, proxyAdmin._address, "0x"]
      })
      .send({
        from: owner,
        gas: constants.MAX_GAS
      });

    const contract = truffleContract({
      abi: unlockAbi.Unlock.abi
    });
    contract.setProvider(web3.currentProvider);
    const contractInstance = await contract.at(proxy._address);
    await contractInstance.initialize(owner, { from: owner });

    return contractInstance;
  },
  getLock: async (web3, lockAddress) => {
    const contract = truffleContract({ abi: unlockAbi.PublicLock.abi });
    contract.setProvider(web3.currentProvider);
    return await contract.at(lockAddress);
  }
};
