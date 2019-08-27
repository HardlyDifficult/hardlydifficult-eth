# HardlyDifficult Truffle Test Helpers

Test helpers for Ethereum.

## Test Contracts

These helpers which will deploy contracts for testing using the exact bytecode and configuration as they have on mainnet, with the exception that you are the owner to enable privileged actions such as `mint`.

You can deploy these to Ganache or any network for testing. The scripts simply use your current web3 configuration.

Using these will give you an accurate representation of gas costs, error conditions, and any oddities to their specific implementation.

**Take a look at the tests for a more complete example of each use case**

### Tokens

 - DAI: ERC-20 with 18 decimals and a mint function
 - USDC: an upgradable ERC-20 with 6 decimals and mint and blacklist functions

Usage example: 

```javascript
const { tokens } = require("hardlydifficult-test-helpers");
const daiOwner = accounts[0];

// Deploy a DAI contract for testing
const dai = await tokens.dai.deploy(web3, daiOwner);

// Mint tokens
await dai.mint(accounts[1], 100, { from: daiOwner });
```

### Protocols 

#### Unlock-Protocol

[unlock-protocol.com](https://unlock-protocol.com):
> Unlock is a membership protocol, built on a blockchain. It enables creators to monetize their content or software without relying on a middleman. It lets consumers manage all of their subscriptions in a consistent way, as well as earn discounts when they share the best content and applications they use.

Usage example:

```javascript
const { protocols } = require("hardlydifficult-test-helpers");
const unlockOwner = accounts[0];

// Deploy the protocol
const unlockProtocol = await protocols.unlock.deploy(web3, unlockOwner);

// Create a new Lock
const tx = await unlockProtocol.createLock(
  60 * 60 * 24, // expirationDuration (in seconds) of 1 day
  web3.utils.padLeft(0, 40), // tokenAddress for ETH
  web3.utils.toWei("0.01", "ether"), // keyPrice
  100, // maxNumberOfKeys
  "Test Lock", // lockName
  {
    from: accounts[1]
  });
const lock = await protocols.unlock.getLock(
  web3,
  tx.logs[1].args.newLockAddress
);

// Buy a Key to that Lock
await lock.purchaseFor(accounts[2], {
  from: accounts[2],
  value: await lock.keyPrice()
});
```

#### Fairmint continous organizations (not yet launched)

[Fairmint.co](https://fairmint.co):

> The continuous financing model enables organizations to finance themselves in a permission-less and non-dilutive way by continuously issuing tokens called FAIR while aligning stakeholders to their financial success.

Usage example:

```javascript
const { protocols } = require("hardlydifficult-test-helpers");
const control = accounts[1];

// Deploy a new c-org (see test for complete list of call options)
const contracts = await protocols.cOrg.deploy(web3, {
  control
});

// You must simulate KYC for to enable new accounts
await contracts.erc1404.approve(accounts[9], true, { from: control })

// Buy FAIR tokens
await dat.buy(accounts[9], "10000000000000", 1, {
  from: accounts[9],
  value: "10000000000000"
});
```

#### Uniswap DEX

[docs.Uniswap.io](https://docs.uniswap.io/):

> Designed with simplicity in mind, the Uniswap protocol provides an interface for seamless exchange of ERC20 tokens on Ethereum.

Usage example:

```javascript
const { tokens, protocols } = require("hardlydifficult-test-helpers");
const protocolOwner = accounts[0];

// Deploy uniswap
const uniswap = await protocols.uniswap.deploy(web3, protocolOwner);
// And a token for testing
const dai = await tokens.dai.deploy(web3, protocolOwner);

// Create an exchange
const tx = await uniswap.createExchange(dai.address, { from: protocolOwner });
const exchange = protocols.uniswap.getExchange(
  web3,
  tx.logs[0].args.exchange
);

// Mint some tokens for testing and approve the exchange
await dai.mint(protocolOwner, "10000000000", { from: protocolOwner });
await dai.approve(exchange.address, -1, { from: protocolOwner });

// Add liquidity to the exchange
await exchange.addLiquidity(
  "1",
  "10000000000",
  Math.round(Date.now() / 1000) + 60,
  {
    from: protocolOwner,
    value: "10000000000"
  }
);

// ...now you can trade!
```
