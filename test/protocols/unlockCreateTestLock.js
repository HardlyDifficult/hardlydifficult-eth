const { constants, protocols } = require("../..");

contract("protocols / unlock / createTestLock", accounts => {
  it("Can create a lock and buy a key", async () => {
    const lock = await protocols.unlock.createTestLock(web3, {
      keyPrice: web3.utils.toWei("0.01", "ether"),
      from: accounts[1] // Lock owner
    });

    const keyPrice = await lock.keyPrice();
    await lock.purchase(keyPrice, accounts[2], constants.ZERO_ADDRESS, [], {
      from: accounts[2],
      value: keyPrice
    });

    const hasKey = await lock.getHasValidKey(accounts[2]);
    assert.equal(hasKey, true);
  });
});
