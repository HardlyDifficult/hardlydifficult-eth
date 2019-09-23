# HardlyDifficult Ethereum Contracts

A collection of reusable contracts and Javascript helpers for Ethereum.

Usage:

```bash
npm i hardlydifficult-ethereum-contracts
```

## Javascript Helpers

These helpers which will deploy contracts for testing using the exact bytecode and configuration as they have on mainnet, with the exception that you are the owner to enable privileged actions such as `mint`.

You can deploy these to Ganache or any network for testing. The scripts simply use your current web3 configuration.

Using these will give you an accurate representation of gas costs, error conditions, and any oddities to their specific implementation.

**Take a look at the [samples](/tree/master/samples) directory for examples**

### Tokens

 - DAI: ERC-20 with 18 decimals and a mint function
 - USDC: an upgradable ERC-20 with 6 decimals and mint and blacklist functions

Usage example: 

```javascript
const { tokens } = require("hardlydifficult-ethereum-contracts");
const from = accounts[0];

// Deploy a DAI contract for testing
const dai = await tokens.dai.deploy(web3, from);

// Mint tokens
await dai.mint(accounts[1], 100, { from });
```

### Protocols 

#### Unlock-Protocol

[unlock-protocol.com](https://unlock-protocol.com):
> Unlock is a membership protocol, built on a blockchain. It enables creators to monetize their content or software without relying on a middleman. It lets consumers manage all of their subscriptions in a consistent way, as well as earn discounts when they share the best content and applications they use.

#### Fairmint continous organizations

(not yet launched)

[Fairmint.co](https://fairmint.co):

> The continuous financing model enables organizations to finance themselves in a permission-less and non-dilutive way by continuously issuing tokens called FAIR while aligning stakeholders to their financial success.

#### Uniswap DEX

[docs.Uniswap.io](https://docs.uniswap.io/):

> Designed with simplicity in mind, the Uniswap protocol provides an interface for seamless exchange of ERC20 tokens on Ethereum.

## Contracts

Reusable contracts which can be imported into your Solidity contract.

 - Intefaces for 3rd party contracts:
   - Uniswap
 - AntiOwnerProxy: set as the owner of a contract to allow anyone to make an ownerOnly call

