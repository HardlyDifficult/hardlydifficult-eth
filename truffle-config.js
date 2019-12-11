module.exports = {
  compilers: {
    solc: {
      version: "0.5.14",
      settings: {
        optimizer: {
          enabled: true,
          runs: 2000000
        }
      }
    }
  },
  plugins: ["solidity-coverage"],
  mocha: {
    reporter: "eth-gas-reporter",
    useColors: true,
    reporterOptions: {
      currency: "USD",
      excludeContracts: ["Migrations"],
      gasPrice: 5
    }
  }
};
