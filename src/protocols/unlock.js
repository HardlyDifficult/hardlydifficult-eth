const { truffleContract } = require("../helpers");
const unlockAbi = require("unlock-abi-1-1");
const unlockJson = require("./unlock.json");
const constants = require("../constants");

const deploy = async (web3, owner) => {
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

  const contractInstance = await truffleContract.at(
    web3,
    unlockAbi.Unlock.abi,
    proxy._address
  );
  await contractInstance.initialize(owner, { from: owner });

  return contractInstance;
};
const getLock = async (web3, lockAddress) => {
  return truffleContract.at(web3, unlockAbi.PublicLock.abi, lockAddress);
};

module.exports = {
  deploy,
  getLock,

  /**
   * Deploys Unlock-Protocol, creates a lock and returns the Lock contract
   *
   * lockOptions is an object with:
   *  - expirationDuration | default of 1 day
   *  - tokenAddress | default of priced in ether
   *  - keyPrice | default of free
   *  - maxNumberOfKeys | default of infinite
   *  - lockName | default of 'Test Lock'
   */
  createTestLock: async (web3, unlockOwner, lockOwner, lockOptions) => {
    const unlockProtocol = await deploy(web3, unlockOwner);
    lockOptions = Object.assign(
      {
        expirationDuration: 60 * 60 * 24, // 1 day
        tokenAddress: web3.utils.padLeft(0, 40), // ether
        keyPrice: 0, // free
        maxNumberOfKeys: -1, // infinite
        lockName: "Test Lock"
      },
      lockOptions
    );
    const tx = await unlockProtocol.createLock(
      lockOptions.expirationDuration,
      lockOptions.tokenAddress,
      lockOptions.keyPrice,
      lockOptions.maxNumberOfKeys,
      lockOptions.lockName,
      {
        from: lockOwner
      }
    );

    return await getLock(web3, tx.logs[1].args.newLockAddress);
  }
};
