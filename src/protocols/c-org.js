const cOrgAbi = require("c-org-abi/abi.json");
const cOrgBytecode = require("c-org-abi/bytecode.json");
const cOrgStaticBytecode = require("c-org-abi/static_bytecode.json");
const constants = require("../constants");
const erc1820 = require("erc1820");

module.exports = {
  deploy: async (web3, options) => {
    // deploy erc1820
    // deploy proxy admin
    // deploy fair
    // deploy fair proxy(implementation, admin)
    // deploy bigDiv
    // deploy dat
    // deploy dat proxy(implementation, admin)
    // deploy test erc1404
    // dat.initialize
    // dat.updateConfig

    await erc1820.deploy(web3); // no harm in calling this multiple times

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
    const fairContract = await new web3.eth.Contract(cOrgAbi.fair)
      .deploy({
        data: cOrgBytecode.fair
      })
      .send({
        from: callOptions.control,
        gas: constants.MAX_GAS
      });
    const fairProxy = await new web3.eth.Contract(cOrgAbi.proxy)
      .deploy({
        data: cOrgBytecode.proxy,
        arguments: [fairContract._address, proxyAdmin._address, "0x"]
      })
      .send({
        from: callOptions.control,
        gas: constants.MAX_GAS
      });
    const fair = new web3.eth.Contract(cOrgAbi.fair, fairProxy._address);

    const bigDiv = await new web3.eth.Contract(cOrgAbi.bigDiv)
      .deploy({
        data: cOrgStaticBytecode.bigDiv
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
    const dat = new web3.eth.Contract(cOrgAbi.dat, datProxy._address);

    await dat.methods
      .initialize(
        bigDiv._address,
        fair._address,
        callOptions.initReserve,
        callOptions.currency,
        callOptions.initGoal,
        callOptions.buySlopeNum,
        callOptions.buySlopeDen,
        callOptions.investmentReserveBasisPoints,
        callOptions.revenueCommitementBasisPoints
      )
      .send({ from: callOptions.control, gas: constants.MAX_GAS });

    const erc1404 = await new web3.eth.Contract([])
      .deploy({
        data: cOrgStaticBytecode.testErc1404
      })
      .send({
        from: callOptions.control,
        gas: constants.MAX_GAS
      });

    await dat.methods
      .updateConfig(
        erc1404._address,
        callOptions.beneficiary,
        callOptions.control,
        callOptions.feeCollector,
        callOptions.feeBasisPoints,
        callOptions.burnThresholdBasisPoints,
        callOptions.minInvestment,
        callOptions.openUntilAtLeast,
        callOptions.name,
        callOptions.symbol
      )
      .send({
        from: callOptions.control,
        gas: constants.MAX_GAS
      });

    return [dat, fair];
  },
  getDat: datAddress => {
    return new web3.eth.Contract(cOrgAbi.dat, datAddress);
  },
  getFair: fairAddress => {
    return new web3.eth.Contract(cOrgAbi.fair, fairAddress);
  }
};
