const testHelpers = require("../..");

contract("tokens / USDC", accounts => {
  const proxyOwner = accounts[9]; // must be different from the tokenOwner
  const tokenOwner = accounts[0];
  let token;

  before(async () => {
    token = await testHelpers.tokens.usdc.deploy(web3, proxyOwner, tokenOwner);
  });

  it("Can mint from owner account", async () => {
    await token.methods.mint(accounts[1], 100).send({ from: tokenOwner });
    const balance = await token.methods.balanceOf(accounts[1]).call();
    assert.equal(balance.toString(), 100);
  });
});
