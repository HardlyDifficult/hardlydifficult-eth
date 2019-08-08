const { protocols } = require("../..");

contract("protocols / unlock", accounts => {
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
      {
        from: accounts[1]
      }
    );

    const lock = await protocols.unlock.getLock(
      web3,
      tx.logs[1].args.newLockAddress
    );

    await lock.purchaseFor(accounts[2], {
      from: accounts[2],
      value: await lock.keyPrice()
    });

    const hasKey = await lock.getHasValidKey(accounts[2]);
    assert.equal(hasKey, true);
  });
});
