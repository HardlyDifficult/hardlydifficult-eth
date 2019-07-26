const unlockAbi = require("unlock-abi-1-1");
const unlockJson = require("./unlock.json");
const { constants } = require("../helpers");

module.exports = {
  deploy: async (web3, owner) => {
    // Deploy contract
    // Deploy proxy(address _implementation)
    // Deploy proxyAdmin
    // proxy.changeAdmin(address proxyAdmin._address)
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

    const contract = new web3.eth.Contract(
      unlockAbi.Unlock.abi,
      proxy._address
    );
    await contract.methods.initialize(owner);

    return contract;
  },
  getLock: lockAddress => {
    return new web3.eth.Contract(unlockAbi.PublicLock.abi, lockAddress);
  }
};
