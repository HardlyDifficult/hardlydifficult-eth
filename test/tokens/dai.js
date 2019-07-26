const testHelpers = require("../..");

contract("tokens / DAI", accounts => {
  const tokenOwner = accounts[0];
  let token;

  before(async () => {
    token = await testHelpers.tokens.dai.deploy(web3, tokenOwner);
  });

  it("Can mint from owner account", async () => {
    await token.methods.mint(accounts[1], 100).send({ from: tokenOwner });
    const balance = await token.methods.balanceOf(accounts[1]).call();
    assert.equal(balance.toString(), 100);
  });
});
