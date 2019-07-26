const { constants, protocols } = require("../..");

contract("protocols / unlock", accounts => {
  const unlockOwner = accounts[0];
  let unlockProtocol;

  before(async () => {
    unlockProtocol = await protocols.unlock.deploy(web3, unlockOwner);
  });

  it("Can create a lock and buy a key", async () => {
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
  });
});
