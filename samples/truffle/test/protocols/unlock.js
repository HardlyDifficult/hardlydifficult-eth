const { constants, protocols } = require("hardlydifficult-eth");

contract("protocols / unlock", (accounts) => {
  const unlockOwner = accounts[0];
  let unlockProtocol;

  before(async () => {
    unlockProtocol = await protocols.unlock.deploy(web3, unlockOwner);
  });

  it("Can create a lock and buy a key", async () => {
    const tx = await unlockProtocol.createLock(
      60 * 60 * 24, // expirationDuration (in seconds) of 1 day
      web3.utils.padLeft(0, 40), // tokenAddress for ETH
      web3.utils.toWei("0.01", "ether"), // keyPrice
      100, // maxNumberOfKeys
      "Test Lock", // lockName
      web3.utils.randomHex(12), // salt
      {
        from: accounts[1],
      }
    );

    const lock = await protocols.unlock.getLock(
      web3,
      tx.logs[0].args.newLockAddress
    );

    const keyPrice = await lock.keyPrice();
    await lock.purchase(keyPrice, accounts[2], constants.ZERO_ADDRESS, [], {
      from: accounts[2],
      value: keyPrice,
    });

    const hasKey = await lock.getHasValidKey(accounts[2]);
    assert.equal(hasKey, true);
  });
});
