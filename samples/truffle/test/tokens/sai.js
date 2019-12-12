const { tokens } = require("hardlydifficult-ethereum-contracts");

contract("tokens / SAI", accounts => {
  const tokenOwner = accounts[0];
  let token;

  before(async () => {
    token = await tokens.dai.deploy(web3, tokenOwner);
  });

  it("Can mint from owner account", async () => {
    await token.mint(accounts[1], 100, { from: tokenOwner });
    const balance = await token.balanceOf(accounts[1]);
    assert.equal(balance.toString(), 100);
  });
});
