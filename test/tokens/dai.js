const { tokens } = require("../..");
const truffleAssertions = require("truffle-assertions");

contract("tokens / DAI", (accounts) => {
  const tokenOwner = accounts[0];
  let token;

  describe("without antiOwner", () => {
    before(async () => {
      token = await tokens.dai.deploy(web3, tokenOwner, false);
    });

    it("Can mint from owner account", async () => {
      await token.mint(accounts[1], 100, { from: tokenOwner });
      const balance = await token.balanceOf(accounts[1]);
      assert.equal(balance.toString(), 100);
    });

    it("Should fail to mint from any other account", async () => {
      await truffleAssertions.fails(
        token.mint(accounts[2], 100, { from: accounts[2] }),
        "revert"
      );
    });
  });

  describe("with antiOwner", () => {
    before(async () => {
      token = await tokens.dai.deploy(web3, tokenOwner, true);
    });

    it("Can mint from owner account", async () => {
      await token.mint(accounts[1], 100, { from: tokenOwner });
      const balance = await token.balanceOf(accounts[1]);
      assert.equal(balance.toString(), 100);
    });

    it("Can mint from any other account", async () => {
      await token.mint(accounts[2], 100, { from: accounts[2] });
      const balance = await token.balanceOf(accounts[2]);
      assert.equal(balance.toString(), 100);
    });
  });
});
