const CloneFactoryMock = artifacts.require("CloneFactoryMock.sol");
const HelloWorld = artifacts.require("HelloWorld.sol");
const truffleAssert = require("truffle-assertions");
const { utils } = require("../../../");

contract("contracts / proxies / clone2Factory", accounts => {
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

  describe("Deploy with Clone 2", () => {
    const salt = web3.utils.randomHex(12);
    let helloWorld;

    beforeEach(async () => {
      const tx = await cloneFactory.createClone2(
        helloWorldTemplate.address,
        salt
      );
      helloWorld = await HelloWorld.at(
        tx.logs.find(l => l.event === "CloneCreated").args.proxyAddress
      );
    });

    it("Can read from the proxy", async () => {
      const result = await helloWorld.helloWorld();
      assert.equal(result, expectedMessage);
    });

    it("Matches the JS calculated address", async () => {
      const address = await utils.create2.buildClone2Address(
        cloneFactory.address,
        helloWorldTemplate.address,
        accounts[0],
        salt
      );
      assert.equal(address, helloWorld.address);
    });

    it("Should fail if a salt is re-used", async () => {
      await truffleAssert.fails(
        cloneFactory.createClone2(helloWorldTemplate.address, salt),
        "revert",
        "PROXY_DEPLOY_FAILED"
      );
    });

    it("Can create more clones as long as the salt is unique", async () => {
      const tx = await cloneFactory.createClone2(
        helloWorldTemplate.address,
        web3.utils.randomHex(12)
      );
      assert.notEqual(tx.logs[0].args.proxyAddress, web3.utils.padLeft(0, 40));
    });

    it("Can use the same salt if the account is different", async () => {
      const tx = await cloneFactory.createClone2(
        helloWorldTemplate.address,
        salt,
        { from: accounts[1] }
      );
      assert.notEqual(tx.logs[0].args.proxyAddress, web3.utils.padLeft(0, 40));
    });
  });
});
