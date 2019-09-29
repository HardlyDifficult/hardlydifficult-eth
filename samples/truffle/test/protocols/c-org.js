const { protocols } = require("hardlydifficult-ethereum-contracts");
const truffleAssert = require("truffle-assertions");

contract("protocols / c-org", accounts => {
  const beneficiary = accounts[0];
  const control = accounts[1];
  const feeCollector = accounts[2];
  let contracts;

  before(async () => {
    contracts = await protocols.cOrg.deploy(web3, {
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

  it("Buy should fail if not approved", async () => {
    await truffleAssert.fails(
      contracts.dat.buy(accounts[9], "10000000000000", 1, {
        from: accounts[9],
        value: "10000000000000"
      }),
      "revert"
    );
  });

  describe("once approved", async () => {
    before(async () => {
      await contracts.whitelist.approve(accounts[9], true, { from: control });
    });

    it("Can buy fair", async () => {
      await contracts.dat.buy(accounts[9], "10000000000000", 1, {
        from: accounts[9],
        value: "10000000000000"
      });

      const balance = await contracts.dat.balanceOf(accounts[9]);
      assert.equal(balance.toString(), "23809500000000");
    });
  });

  describe("after purchase", async () => {
    before(async () => {
      await contracts.whitelist.approve(accounts[9], true, { from: control });
      await contracts.dat.buy(accounts[9], "10000000000000", 1, {
        from: accounts[9],
        value: "10000000000000"
      });
    });

    it("totalSupply > 0", async () => {
      const totalSupply = await contracts.dat.totalSupply();
      assert.notEqual(totalSupply.toString(), "0");
    });
  });
});
