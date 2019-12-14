const UtilsMock = artifacts.require("UtilsMock.sol");

contract("contracts / utils / gas", () => {
  let contract;

  beforeEach(async () => {
    contract = await UtilsMock.new();
  });

  it("Can read gasPrice", async () => {
    const gasPrice = 42000000;
    const price = await contract.gasPrice({ gasPrice });
    assert.equal(price, gasPrice);
  });
});
