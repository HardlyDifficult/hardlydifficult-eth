const truffleContract = require("truffle-contract");
const cOrgAbi = require("c-org-abi/abi.json");
const cOrgBytecode = require("c-org-abi/bytecode.json");
const cOrgStaticBytecode = require("c-org-abi/static_bytecode.json");
const constants = require("../constants");

async function getDat(web3, datAddress) {
  const contract = truffleContract({ abi: cOrgAbi.dat });
  contract.setProvider(web3.currentProvider);
  return await contract.at(datAddress);
}

async function getErc1404(web3, erc1404Address) {
  const contract = truffleContract({ abi: cOrgAbi.erc1404 });
  contract.setProvider(web3.currentProvider);
  return await contract.at(erc1404Address);
}

module.exports = {
  deploy: async (web3, options) => {
    // deploy proxy admin
    // deploy bigMath
    // deploy dat
    // deploy dat proxy(implementation, admin)
    // deploy erc1404
    // deploy erc1404 proxy(implementation, admin)
    // erc1404.initialize
    // dat.initialize (which calls fair.initialize)
    // dat.updateConfig

    const callOptions = Object.assign(
      {
        initReserve: "42000000000000000000",
        currency: "0x0000000000000000000000000000000000000000",
        initGoal: "0",
        buySlopeNum: "1",
        buySlopeDen: "100000000000000000000",
        investmentReserveBasisPoints: "1000",
        revenueCommitementBasisPoints: "1000",
        feeBasisPoints: "0",
        burnThresholdBasisPoints: "0",
        minInvestment: "1",
        openUntilAtLeast: "0",
        name: "FAIR token",
        symbol: "FAIR",
        beneficiary: options.control,
        feeCollector: options.control
      },
      options
    );

    const proxyAdmin = await new web3.eth.Contract(cOrgAbi.proxyAdmin)
      .deploy({
        data: cOrgBytecode.proxyAdmin
      })
      .send({
        from: callOptions.control,
        gas: constants.MAX_GAS
      });
    const bigMath = await new web3.eth.Contract(cOrgAbi.bigMath)
      .deploy({
        data: cOrgStaticBytecode.bigMath
      })
      .send({
        from: callOptions.control,
        gas: constants.MAX_GAS
      });

    const datContract = await new web3.eth.Contract(cOrgAbi.dat)
      .deploy({
        data: cOrgBytecode.dat
      })
      .send({
        from: callOptions.control,
        gas: constants.MAX_GAS
      });
    const datProxy = await new web3.eth.Contract(cOrgAbi.proxy)
      .deploy({
        data: cOrgBytecode.proxy,
        arguments: [datContract._address, proxyAdmin._address, "0x"]
      })
      .send({
        from: callOptions.control,
        gas: constants.MAX_GAS
      });
    const dat = await getDat(web3, datProxy._address);

    await dat.initialize(
      bigMath._address,
      callOptions.initReserve,
      callOptions.currency,
      callOptions.initGoal,
      callOptions.buySlopeNum,
      callOptions.buySlopeDen,
      callOptions.investmentReserveBasisPoints,
      callOptions.revenueCommitementBasisPoints,
      { from: callOptions.control }
    );

    const erc1404Contract = await new web3.eth.Contract(cOrgAbi.erc1404)
      .deploy({
        data: cOrgBytecode.erc1404
      })
      .send({
        from: callOptions.control,
        gas: constants.MAX_GAS
      });
    const erc1404Proxy = await new web3.eth.Contract(cOrgAbi.proxy)
      .deploy({
        data: cOrgBytecode.proxy,
        arguments: [erc1404Contract._address, proxyAdmin._address, "0x"]
      })
      .send({
        from: callOptions.control,
        gas: constants.MAX_GAS
      });

    const erc1404 = await getErc1404(web3, erc1404Proxy._address);
    await erc1404.initialize({ from: callOptions.control });
    await erc1404.approve(dat.address, true, { from: callOptions.control });
    await erc1404.approve(callOptions.beneficiary, true, {
      from: callOptions.control
    });
    await erc1404.approve(callOptions.control, true, {
      from: callOptions.control
    });
    await erc1404.approve(callOptions.feeCollector, true, {
      from: callOptions.control
    });

    await dat.updateConfig(
      erc1404.address,
      callOptions.beneficiary,
      callOptions.control,
      callOptions.feeCollector,
      callOptions.feeBasisPoints,
      callOptions.burnThresholdBasisPoints,
      callOptions.minInvestment,
      callOptions.openUntilAtLeast,
      callOptions.name,
      callOptions.symbol,
      {
        from: callOptions.control
      }
    );

    return { dat, erc1404 };
  },
  getDat,
  getErc1404
};
