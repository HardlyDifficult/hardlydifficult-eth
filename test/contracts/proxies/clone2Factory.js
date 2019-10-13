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

  describe("Deploy with Clone 2 with various salts", () => {
    const testSalts = [
      "0x000000000000000000000000",
      "0x000000000000000000000001",
      "0x000000000000000000000002",
      "0xffffffffffffffffffffffff",
      "0xefffffffffffffffffffffff",
      "0xdfffffffffffffffffffffff",
      web3.utils.randomHex(12),
      web3.utils.randomHex(12)
    ];
    for (let i = 0; i < testSalts.length; i++) {
      const salt = testSalts[i].toString(16);

      describe(`Salt: ${salt}`, () => {
        let helloWorld;

        it("isAddressAvailable == true", async () => {
          const address = await utils.create2.buildClone2Address(
            cloneFactory.address,
            helloWorldTemplate.address,
            accounts[0],
            salt
          );
          const available = await cloneFactory.isAddressAvailable(address);
          assert.equal(available, true);
        });

        describe("After creation", () => {
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

          it("Matches the Clone2Probe calculated address", async () => {
            const address = await cloneFactory.getClone2Address(
              helloWorldTemplate.address,
              salt
            );
            assert.equal(address, helloWorld.address);
          });

          it("isAddressAvailable == false", async () => {
            const address = await utils.create2.buildClone2Address(
              cloneFactory.address,
              helloWorldTemplate.address,
              accounts[0],
              salt
            );
            const available = await cloneFactory.isAddressAvailable(address);
            assert.equal(available, false);
          });

          it("Should fail if a salt is re-used", async () => {
            await truffleAssert.fails(
              cloneFactory.createClone2(helloWorldTemplate.address, salt),
              "revert",
              "PROXY_DEPLOY_FAILED"
            );
          });

          it("Can use the same account if the salt is different", async () => {
            const tx = await cloneFactory.createClone2(
              helloWorldTemplate.address,
              web3.utils.randomHex(12),
              { from: accounts[1] }
            );
            assert.notEqual(
              tx.logs[0].args.proxyAddress,
              web3.utils.padLeft(0, 40)
            );
          });

          it("Can use the same salt if the account is different", async () => {
            const tx = await cloneFactory.createClone2(
              helloWorldTemplate.address,
              salt,
              { from: accounts[1] }
            );
            assert.notEqual(
              tx.logs[0].args.proxyAddress,
              web3.utils.padLeft(0, 40)
            );
          });
        });
      });
    }
  });
});
