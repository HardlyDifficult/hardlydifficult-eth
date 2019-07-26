# hardlydifficult-test-helpers

Test helpers for Ethereum.

## Tokens

These helpers which will deploy token contracts for testing using the exact bytecode and configuration as they have on mainnet, with the exception that you are the owner to enable privileged actions like `mint`.

You can deploy to Ganache or to any network for testing. The scripts simply use your current web3 configuration.

Using these will give you an accurate representation of gas costs, error conditions, and any oddities to their specific implementation.

 - DAI: ERC-20 with 18 decimals and a mint function
 - USDC: an upgradable ERC-20 with 6 decimals and mint and blacklist functions

Usage example: 

```javascript
const { tokens } = require("hardlydifficult-test-helpers");
const daiOwner = accounts[0];

// Deploy a DAI contract for testing
const dai = await tokens.dai.deploy(web3, proxyOwner, daiOwner);

// Mint tokens, then interact via the ERC-20 interface
await dai.methods.mint(accounts[1], 100).send({ from: daiOwner });
```

You can use these while testing your smart-contracts by deploying in your Truffle test and then interacting with the tokens using the ERC-20 interface from [OpenZeppelin-Solidity](https://www.npmjs.com/package/openzeppelin-solidity).

## Unlock-Protocol

[unlock-protocol.com](https://unlock-protocol.com):
> Unlock is a membership protocol, built on a blockchain. It enables creators to monetize their content or software without relying on a middleman. It lets consumers manage all of their subscriptions in a consistent way, as well as earn discounts when they share the best content and applications they use.

This helper will deploy the Unlock contract for testing using the bytecode from the current mainnet version.  It allows you to create a Lock for testing with Ganache or on any network.

Usage example:

```javascript
const { constants, protocols } = require("hardlydifficult-test-helpers");

const unlockOwner = accounts[0];
let unlockProtocol;

unlockProtocol = await protocols.unlock.deploy(web3, unlockOwner);
const tx = await unlockProtocol.methods
  .createLock(
    60 * 60 * 24, // expirationDuration (in seconds) of 1 day
    web3.utils.padLeft(0, 40), // tokenAddress for ETH
    web3.utils.toWei("0.01", "ether"), // keyPrice
    100, // maxNumberOfKeys
    "Test Lock" // lockName
  )
  .send({
    from: accounts[1],
    gas: constants.MAX_GAS
  });

const lock = protocols.unlock.getLock(
  tx.events.NewLock.returnValues.newLockAddress
);

await lock.methods.purchaseFor(accounts[2]).send({
  from: accounts[2],
  value: await lock.methods.keyPrice().call(),
  gas: constants.MAX_GAS
});

const hasKey = await lock.methods.getHasValidKey(accounts[2]).call();
assert.equal(hasKey, true);
```
