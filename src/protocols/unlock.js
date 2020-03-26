const { truffleContract } = require("../helpers");
const unlockAbi = require("unlock-abi-7");
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
  createTestLock: async (web3, options) => {
    if (!options.from) throw new Error("`options.from` is required");

    // using the lock owner as the protocol owner as well, to simplify the api
    const unlockProtocol = await deploy(web3, options.from);
    options = Object.assign(
      {
        expirationDuration: 60 * 60 * 24, // 1 day
        tokenAddress: web3.utils.padLeft(0, 40), // ether
        keyPrice: 0, // free
        maxNumberOfKeys: -1, // infinite
        lockName: "Test Lock"
      },
      options
    );
    const tx = await unlockProtocol.createLock(
      options.expirationDuration,
      options.tokenAddress,
      options.keyPrice,
      options.maxNumberOfKeys,
      options.lockName,
      web3.utils.randomHex(12), // salt
      {
        from: options.from
      }
    );

    return await getLock(web3, tx.logs[1].args.newLockAddress);
  }
};
