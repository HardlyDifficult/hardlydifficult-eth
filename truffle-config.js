module.exports = {
  networks: {
    development: {
      gas: 6721974,
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
    },
  },
  compilers: {
    solc: {
      version: "0.6.10",
      settings: {
        optimizer: {
          enabled: true,
          runs: 2000000,
        },
      },
    },
  },
  plugins: ["solidity-coverage"],
  mocha: {
    reporter: "eth-gas-reporter",
    useColors: true,
    reporterOptions: {
      currency: "USD",
      excludeContracts: ["Migrations"],
      gasPrice: 5,
    },
  },
};
