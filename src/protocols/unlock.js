const { truffleContract } = require("../helpers");
const unlockAbi = require("unlock-abi-1-3");
const unlockJson = require("./unlock.json");
const constants = require("../constants");
const erc1820 = require("erc1820");

const deploy = async (web3, owner) => {
  // Deploy erc-1820
  // Deploy contract template
  // Deploy proxy(address _implementation)
  // Deploy proxyAdmin
  // proxy.initialize(address _owner)
  // proxy.configUnlock(template, symbol, url)
  await erc1820.deploy(web3);
  const unlockContract = await new web3.eth.Contract(unlockAbi.Unlock.abi)
    .deploy({
      data: `0x${unlockAbi.Unlock.bytecode.replace(/0x/, "")}`
    })
    .send({
      from: owner,
      gas: constants.MAX_GAS
    });
  const proxyAdmin = await new web3.eth.Contract(unlockJson.proxyAdmin.abi)
    .deploy({
      data: `0x${unlockJson.proxyAdmin.bytecode.replace(/0x/, "")}`
    })
    .send({
      from: owner,
      gas: constants.MAX_GAS
    });
  const proxy = await new web3.eth.Contract(unlockJson.proxy.abi)
    .deploy({
      data: `0x${unlockJson.proxy.bytecode.replace(/0x/, "")}`,
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
  const lockTemplate = await new web3.eth.Contract(unlockAbi.PublicLock.abi)
    .deploy({
      data: `0x${unlockAbi.PublicLock.bytecode.replace(/0x/, "")}`
    })
    .send({
      from: owner,
      gas: constants.MAX_GAS
    });
  await contractInstance.configUnlock(
    lockTemplate._address,
    "TLK",
    "http://192.168.0.1/",
    { from: owner }
  );

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
      web3.utils.randomHex(12), // salt
      {
        from: lockOwner
      }
    );

    return await getLock(web3, tx.logs[1].args.newLockAddress);
  }
};
