const CloneFactoryMock = artifacts.require("CloneFactoryMock.sol");
const HelloWorld = artifacts.require("HelloWorld.sol");
const truffleAssert = require("truffle-assertions");

contract("contracts / proxies / cloneFactory", () => {
  const expectedMessage = "Hello World o/";
  let cloneFactory;
  let helloWorldTemplate;

  beforeEach(async () => {
    cloneFactory = await CloneFactoryMock.new();
    helloWorldTemplate = await HelloWorld.new();
  });

  it("Sanity check: can read from hello world directly", async () => {
    const result = await helloWorldTemplate.helloWorld();
    assert.equal(result, expectedMessage);
  });

  describe("Deploy with Clone 1", () => {
    let helloWorld;

    beforeEach(async () => {
      const tx = await cloneFactory.createClone(helloWorldTemplate.address);
      helloWorld = await HelloWorld.at(tx.logs[0].args.proxyAddress);
    });

    it("Can read from the proxy", async () => {
      const result = await helloWorld.helloWorld();
      assert.equal(result, expectedMessage);
    });

    it("Should fail if there's not enough gas to deploy", async () => {
      await truffleAssert.fails(
        cloneFactory.createClone(helloWorldTemplate.address, {
          gas: 65000 // should be just shy of what we need
        }),
        "out of gas"
      );
    });

    it("Can create more clones", async () => {
      const tx = await cloneFactory.createClone(helloWorldTemplate.address);
      assert.notEqual(tx.logs[0].args.proxyAddress, web3.utils.padLeft(0, 40));
    });
  });
});
