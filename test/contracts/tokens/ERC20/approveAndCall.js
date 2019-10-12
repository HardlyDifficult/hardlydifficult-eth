const { protocols, tokens } = require("../../../..");
const ApproveAndCall = artifacts.require("ApproveAndCall.sol");

contract("contracts / approveAndCall", accounts => {
  const owner = accounts[0];
  const keyPrice = web3.utils.toWei("0.00042", "ether");
  let token;
  let lock1;
  let lock2;
  let approveAndCall;

  beforeEach(async () => {
    // Token
    token = await tokens.dai.deploy(web3, owner);
    await token.mint(accounts[2], "100000000000000000000", { from: owner });

    // Locks priced in ERC-20 tokens
    lock1 = await protocols.unlock.createTestLock(
      web3,
      accounts[9], // Unlock Protocol owner
      accounts[1], // Lock owner
      {
        tokenAddress: token.address,
        keyPrice
      }
    );
    lock2 = await protocols.unlock.createTestLock(
      web3,
      accounts[9], // Unlock Protocol owner
      accounts[1], // Lock owner
      {
        tokenAddress: token.address,
        keyPrice
      }
    );

    // ApproveAndCall
    approveAndCall = await ApproveAndCall.new();
  });

  it("Sanity check: Can approve & purchase directly", async () => {
    await token.approve(lock1.address, keyPrice, { from: accounts[2] });
    await lock1.purchaseFor(accounts[2], {
      from: accounts[2]
    });
  });

  it("Gas check: approve keyPrice", async () => {
    await token.approve(lock1.address, keyPrice, { from: accounts[2] });
  });

  it("Gas check: approve unlimited", async () => {
    await token.approve(approveAndCall.address, -1, { from: accounts[2] });
  });

  describe("After approving the ApproveAndCall contract", async () => {
    beforeEach(async () => {
      await token.approve(approveAndCall.address, -1, { from: accounts[2] });
    });

    it("Can purchase keys with via ApproveAndCall", async () => {
      const callData = web3.eth.abi.encodeFunctionCall(
        lock1.abi.find(e => e.name === "purchaseFor"),
        [accounts[2]]
      );
      await approveAndCall.approveAndCall(
        token.address,
        keyPrice,
        lock1.address,
        callData,
        {
          from: accounts[2]
        }
      );

      const hasKey = await lock1.getHasValidKey(accounts[2]);
      assert.equal(hasKey, true);
    });

    it("And from Lock2 without an additional approval", async () => {
      const callData = web3.eth.abi.encodeFunctionCall(
        lock2.abi.find(e => e.name === "purchaseFor"),
        [accounts[2]]
      );
      await approveAndCall.approveAndCall(
        token.address,
        keyPrice,
        lock2.address,
        callData,
        {
          from: accounts[2]
        }
      );

      const hasKey = await lock2.getHasValidKey(accounts[2]);
      assert.equal(hasKey, true);
    });
  });
});
