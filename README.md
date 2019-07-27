# hardlydifficult-test-helpers

Test helpers for Ethereum.

These helpers which will deploy contracts for testing using the exact bytecode and configuration as they have on mainnet, with the exception that you are the owner to enable privileged actions such as `mint`.

You can deploy these to Ganache or any network for testing. The scripts simply use your current web3 configuration.

Using these will give you an accurate representation of gas costs, error conditions, and any oddities to their specific implementation.

## Tokens

 - DAI: ERC-20 with 18 decimals and a mint function
 - USDC: an upgradable ERC-20 with 6 decimals and mint and blacklist functions

Usage example: 

```javascript
const { tokens } = require("hardlydifficult-test-helpers");
const daiOwner = accounts[0];
// Deploy a DAI contract for testingerface
const dai = await tokens.dai.deploy(web3, daiOwn

// Mint tokens, then interact via the ERC-20 inter);

await dai.methods.mint(accounts[1], 100).send({ from: daiOwner });
```

You can use these while testing your smart-contracts by deploying in your Truffle test and then interacting with the tokens using the ERC-20 interface from [OpenZeppelin-Solidity](https://www.npmjs.com/package/openzeppelin-solidity).


## Protocols 

### Unlock-Protocol

[unlock-protocol.com](https://unlock-protocol.com):
> Unlock is a membership protocol, built on a blockchain. It enables creators to monetize their content or software without relying on a middleman. It lets consumers manage all of their subscriptions in a consistent way, as well as earn discounts when they share the best content and applications they use.

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

### Fairmint continous organizations (not yet launched)

[Fairmint.co](https://fairmint.co):

> The continuous financing model enables organizations to finance themselves in a permission-less and non-dilutive way by continuously issuing tokens called FAIR while aligning stakeholders to their financial success.

Usage example:

```javascript
const { constants, protocols } = require("hardlydifficult-test-helpers");

const beneficiary = accounts[0];
const control = accounts[1];
const feeCollector = accounts[2];

const [dat, fair] = await protocols.cOrg.deploy(web3, {
  initReserve: "42000000000000000000",
  currency: web3.utils.padLeft(0, 40),
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
  control,
  beneficiary,
  feeCollector
});

await dat.methods.buy(accounts[3], "10000000000000", 1).send({
  from: accounts[3],
  value: "10000000000000",
  gas: constants.MAX_GAS
});

const balance = await fair.methods.balanceOf(accounts[3]).call();
assert.equal(balance.toString(), "23809500000000");
```

### Uniswap DEX

[docs.Uniswap.io](https://docs.uniswap.io/):

> Designed with simplicity in mind, the Uniswap protocol provides an interface for seamless exchange of ERC20 tokens on Ethereum.

Usage example:

```javascript
const { constants, tokens, protocols } = require("hardlydifficult-test-helpers");

contract("protocols / uniswap", accounts => {
  const protocolOwner = accounts[0];
  let uniswap;
  let dai;

  before(async () => {
    uniswap = await protocols.uniswap.deploy(web3, protocolOwner);
    dai = await tokens.dai.deploy(web3, protocolOwner);
  });

  it("Can create an exchange and add liquidity", async () => {
    const tx = await uniswap.methods
      .createExchange(dai._address)
      .send({ from: protocolOwner, gas: constants.MAX_GAS });
    const exchange = protocols.uniswap.getExchange(
      tx.events.NewExchange.returnValues.exchange
    );
    await dai.methods
      .mint(protocolOwner, "10000000000")
      .send({ from: protocolOwner });
    await dai.methods
      .approve(exchange._address, -1)
      .send({ from: protocolOwner });
    await exchange.methods
      .addLiquidity("1", "10000000000", Math.round(Date.now() / 1000) + 60)
      .send({
        from: protocolOwner,
        value: "10000000000",
        gas: constants.MAX_GAS
      });
  });
});
```