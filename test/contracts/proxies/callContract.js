const CallContractMock = artifacts.require("CallContractMock.sol");
const TestReturnValue = artifacts.require("TestReturnValue.sol");
const { constants, protocols } = require("../../..");

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
    const keyPrice = await lock.keyPrice();
    await lock.purchase(keyPrice, accounts[2], constants.ZERO_ADDRESS, [], {
      from: accounts[2],
      value: keyPrice
    });
    const callData = web3.eth.abi.encodeFunctionCall(
      lock.abi.find(e => e.name === "purchase"),
      [keyPrice.toString(), accounts[2], constants.ZERO_ADDRESS, []]
    );
    await callContract.call(lock.address, callData, {
      value: keyPrice
    });

    const hasKey = await lock.getHasValidKey(accounts[2]);
    assert.equal(hasKey, true);
  });

  it("Can call a function by position", async () => {
    const keyPrice = await lock.keyPrice();
    await lock.purchase(keyPrice, accounts[2], constants.ZERO_ADDRESS, [], {
      from: accounts[2],
      value: keyPrice
    });
    const callData = web3.eth.abi.encodeFunctionCall(
      lock.abi.find(e => e.name === "purchase"),
      [keyPrice.toString(), accounts[2], constants.ZERO_ADDRESS, []]
    );
    await callContract.callByPosition(
      lock.address,
      callData,
      0,
      callData.length,
      {
        value: keyPrice
      }
    );

    const hasKey = await lock.getHasValidKey(accounts[2]);
    assert.equal(hasKey, true);
  });

  it("Can call a function by position when data is offset", async () => {
    const keyPrice = await lock.keyPrice();
    await lock.purchase(keyPrice, accounts[2], constants.ZERO_ADDRESS, [], {
      from: accounts[2],
      value: keyPrice
    });
    let callData = web3.eth.abi.encodeFunctionCall(
      lock.abi.find(e => e.name === "purchase"),
      [keyPrice.toString(), accounts[2], constants.ZERO_ADDRESS, []]
    );
    const originalLength = callData.length;
    const prefix = "123412341234";
    const suffix = "12";
    callData = `0x${prefix}${callData.substring(2)}${suffix}`;
    await callContract.callByPosition(
      lock.address,
      callData,
      prefix.length / 2,
      originalLength / 2,
      {
        value: keyPrice
      }
    );

    const hasKey = await lock.getHasValidKey(accounts[2]);
    assert.equal(hasKey, true);
  });
});
