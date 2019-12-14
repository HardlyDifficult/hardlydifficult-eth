const CallContractMock = artifacts.require("CallContractMock.sol");
const TestReturnValue = artifacts.require("TestReturnValue.sol");
const { protocols } = require("../../..");

let callContract, returnValueContract, lock;

contract("contracts / proxies / callContract", accounts => {
  beforeEach(async () => {
    callContract = await CallContractMock.new();
    returnValueContract = await TestReturnValue.new();
    lock = await protocols.unlock.createTestLock(
      web3,
      accounts[9], // Unlock Protocol owner
      accounts[1], // Lock owner
      {
        keyPrice: web3.utils.toWei("0.01", "ether")
      }
    );
  });

  it("Can read uint", async () => {
    const callData = web3.eth.abi.encodeFunctionCall(
      returnValueContract.abi.find(e => e.name === "return42"),
      []
    );
    const result = await callContract.readUint(
      returnValueContract.address,
      callData
    );
    assert.equal(result, 42);
  });

  it("Can call a function", async () => {
    await lock.purchaseFor(accounts[2], {
      from: accounts[2],
      value: await lock.keyPrice()
    });
    const callData = web3.eth.abi.encodeFunctionCall(
      lock.abi.find(e => e.name === "purchaseFor"),
      [accounts[2]]
    );
    await callContract.call(lock.address, callData, {
      value: await lock.keyPrice()
    });

    const hasKey = await lock.getHasValidKey(accounts[2]);
    assert.equal(hasKey, true);
  });
});
