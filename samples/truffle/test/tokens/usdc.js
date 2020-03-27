const { tokens } = require("hardlydifficult-ethereum-contracts");

contract("tokens / USDC", (accounts) => {
  const proxyOwner = accounts[9]; // must be different from the tokenOwner
  const tokenOwner = accounts[0];
  let token;

  before(async () => {
    token = await tokens.usdc.deploy(web3, proxyOwner, tokenOwner);
  });

  it("Can mint from owner account", async () => {
    await token.mint(accounts[1], 100, { from: tokenOwner });
    const balance = await token.balanceOf(accounts[1]);
    assert.equal(balance.toString(), 100);
  });
});
