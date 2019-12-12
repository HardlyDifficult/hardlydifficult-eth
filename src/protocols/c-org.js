const cOrgAbi = require("@fairmint/c-org-abi/abi.json");
const cOrgBytecode = require("@fairmint/c-org-abi/bytecode.json");
const { truffleContract } = require("../helpers");
const constants = require("../constants");

async function getDat(web3, datAddress) {
  return await truffleContract.at(web3, cOrgAbi.dat, datAddress);
}

async function getWhitelist(web3, whitelistAddress) {
  return await truffleContract.at(web3, cOrgAbi.whitelist, whitelistAddress);
}

module.exports = {
  deploy: async (web3, options) => {
    // deploy proxy admin
    // deploy dat template
    // deploy dat proxy(implementation, admin)
    // deploy whitelist template
    // deploy whitelist proxy(implementation, admin)
    // whitelist.initialize
    // dat.initialize
    // dat.updateConfig

    const callOptions = Object.assign(
      {
        initReserve: "42000000000000000000",
        currency: "0x0000000000000000000000000000000000000000",
        initGoal: "0",
        buySlopeNum: "1",
        buySlopeDen: "100000000000000000000",
        investmentReserveBasisPoints: "1000",
        revenueCommitmentBasisPoints: "1000",
        feeBasisPoints: "0",
        burnThresholdBasisPoints: false,
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
      callOptions.initReserve,
      callOptions.currency,
      callOptions.initGoal,
      callOptions.buySlopeNum,
      callOptions.buySlopeDen,
      callOptions.investmentReserveBasisPoints,
      callOptions.name,
      callOptions.symbol,
      { from: callOptions.control }
    );

    const whitelistContract = await new web3.eth.Contract(cOrgAbi.whitelist)
      .deploy({
        data: cOrgBytecode.whitelist
      })
      .send({
        from: callOptions.control,
        gas: constants.MAX_GAS
      });
    const whitelistProxy = await new web3.eth.Contract(cOrgAbi.proxy)
      .deploy({
        data: cOrgBytecode.proxy,
        arguments: [whitelistContract._address, proxyAdmin._address, "0x"]
      })
      .send({
        from: callOptions.control,
        gas: constants.MAX_GAS
      });

    const whitelist = await getWhitelist(web3, whitelistProxy._address);
    await whitelist.initialize(dat.address, { from: callOptions.control });
    await whitelist.approve(dat.address, true, { from: callOptions.control });
    await whitelist.approve(callOptions.beneficiary, true, {
      from: callOptions.control
    });
    await whitelist.approve(callOptions.control, true, {
      from: callOptions.control
    });
    await whitelist.approve(callOptions.feeCollector, true, {
      from: callOptions.control
    });

    await dat.updateConfig(
      whitelist.address,
      callOptions.beneficiary,
      callOptions.control,
      callOptions.feeCollector,
      callOptions.feeBasisPoints,
      callOptions.autoBurn,
      callOptions.revenueCommitmentBasisPoints,
      callOptions.minInvestment,
      callOptions.openUntilAtLeast,
      {
        from: callOptions.control
      }
    );

    return { dat, whitelist };
  },
  getDat,
  getWhitelist
};
