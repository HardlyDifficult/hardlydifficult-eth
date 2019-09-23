const truffleContract = require("truffle-contract");
const usdcJson = require("./usdc.json");
const constants = require("../constants");
const utils = require("../utils");

module.exports = {
  /**
   * @param useAntiOwner true to use a proxy contract allowing any account to call `mint`.
   */
  deploy: async (web3, proxyOwner, tokenOwner, useAntiOwner) => {
    // Deploy token contract: https://etherscan.io/address/0x0882477e7895bdc5cea7cb1552ed914ab157fe56#code
    // Deploy proxy: https://etherscan.io/address/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48#code
    // constructor(address _implementation)
    // Initialize: https://etherscan.io/tx/0xe152b8a0d9e83ddaa0158d7ca9beb0636d66e53e9498e5deb5a25aa3a324fba7
    // initialize(string _name, string _symbol, string _currency, uint8 _decimals, address _masterMinter, address _pauser, address _blacklister, address _owner)
    // configureMinter(address _minter, uint256 _max)

    const tokenContract = await new web3.eth.Contract(usdcJson.abi)
      .deploy({
        data: usdcJson.bytecode
      })
      .send({
        from: proxyOwner,
        gas: constants.MAX_GAS
      });
    const proxy = await new web3.eth.Contract(usdcJson.proxy.abi)
      .deploy({
        data: usdcJson.proxy.bytecode,
        arguments: [tokenContract._address]
      })
      .send({
        from: proxyOwner,
        gas: constants.MAX_GAS
      });
    const token = new web3.eth.Contract(usdcJson.abi, proxy._address);
    await token.methods
      .initialize(
        "USD//C",
        "USDC",
        "USD",
        6,
        tokenOwner,
        tokenOwner,
        tokenOwner,
        tokenOwner
      )
      .send({
        from: tokenOwner,
        gas: constants.MAX_GAS
      });
    await token.methods
      .configureMinter(tokenOwner, -1)
      .send({ from: tokenOwner });

    const contract = truffleContract({
      abi: usdcJson.abi
    });
    contract.setProvider(web3.currentProvider);

    const result = await contract.at(token._address);

    if(useAntiOwner) {
      const antiOwnerProxy = await utils.antiOwnerProxy.deploy(web3, tokenOwner);
      await result.configureMinter(antiOwnerProxy.address, -1, { from: tokenOwner });
      await result.updateMasterMinter(antiOwnerProxy.address, { from: tokenOwner });
      await result.updatePauser(antiOwnerProxy.address, { from: tokenOwner });
      await result.updateBlacklister(antiOwnerProxy.address, { from: tokenOwner });
      await result.transferOwnership(antiOwnerProxy.address, { from: tokenOwner });
      result.mint = async (to, amount, options) => {
        const callData = web3.eth.abi.encodeFunctionCall(usdcJson.abi.find(e => e.name === 'mint'), [to, amount])
        await antiOwnerProxy.proxyCall(result.address, callData, options);
      }
    }

    return result;
  }
};
