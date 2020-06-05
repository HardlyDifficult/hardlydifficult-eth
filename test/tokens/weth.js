const { tokens } = require("../..");

contract("tokens / WETH", (accounts) => {
  let token;

  beforeEach(async () => {
    // The from address is not relevant for this token
    token = await tokens.weth.deploy(web3, accounts[9]);
  });

  it("Can deposit", async () => {
    const account = accounts[1];
    const value = web3.utils.toWei("4.2", "ether");
    await token.deposit({ from: account, value });
    const balance = await token.balanceOf(account);
    assert.equal(balance.toString(), value);
  });
});
