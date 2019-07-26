# hardlydifficult-test-helpers

Test helpers for Ethereum.

## Tokens

These helpers which will deploy token contracts for testing using the exact bytecode and configuration as they have on mainnet, with the exception that you are the owner to enable privileged actions like `mint`.

You can deploy to Ganache or to any network for testing. The scripts simply use your current web3 configuration.

Using these will give you an accurate representation of gas costs, error conditions, and any oddities to their specific implementation.

 - DAI: ERC-20 with 18 decimals and a mint function
 - USDC: an upgradable ERC-20 with 6 decimals and mint and blacklist functions

Usage example:

```
const testHelpers = require("hardlydifficult-test-helpers");
const daiOwner = accounts[0];
const dai = await testHelpers.tokens.dai.deploy(web3, proxyOwner, daiOwner);
await dai.methods.mint(accounts[1], 100).send({ from: daiOwner });
```

You can use these while testing your smart-contracts by deploying in your Truffle test and then interacting with the tokens using the ERC-20 interface from [OpenZeppelin-Solidity](https://www.npmjs.com/package/openzeppelin-solidity).

## Unlock-Protocol

[unlock-protocol.com](https://unlock-protocol.com):
> Unlock is a membership protocol, built on a blockchain. It enables creators to monetize their content or software without relying on a middleman. It lets consumers manage all of their subscriptions in a consistent way, as well as earn discounts when they share the best content and applications they use.

This helper will deploy the Unlock contract for testing using the bytecode from the current mainnet version.  It allows you to create a Lock for testing with Ganache or on any network.

Usage example:

```
const testHelpers = require("hardlydifficult-test-helpers");

TODO
```