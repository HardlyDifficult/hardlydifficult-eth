const { protocols } = require("../..");

contract("protocols / c-org", accounts => {
  const beneficiary = accounts[0];
  const control = accounts[1];
  const feeCollector = accounts[2];
  let dat, fair;

  before(async () => {
    [dat, fair] = await protocols.cOrg.deploy(web3, {
      initReserve: "42000000000000000000",
      currency: web3.utils.padLeft(0, 40),
      initGoal: "0",
      buySlopeNum: "1",
      buySlopeDen: "100000000000000000000",
      investmentReserveBasisPoints: "1000",
      revenueCommitementBasisPoints: "1000",
      feeBasisPoints: "0",
      burnThresholdBasisPoints: "0",
      minInvestment: "1",
      openUntilAtLeast: "0",
      name: "FAIR token",
      symbol: "FAIR",
      control,
      beneficiary,
      feeCollector
    });
  });

  it("Can buy fair", async () => {
    await dat.buy(accounts[3], "10000000000000", 1, {
      from: accounts[3],
      value: "10000000000000"
    });

    const balance = await fair.balanceOf(accounts[3]);
    assert.equal(balance.toString(), "23809500000000");
  });
});
