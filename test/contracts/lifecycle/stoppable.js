const { accounts, contract } = require("@openzeppelin/test-environment");
const { expectEvent, expectRevert } = require("@openzeppelin/test-helpers");
const { expect } = require("chai");
const StoppableMock = contract.fromArtifact("StoppableMock");
const { reverts } = require("truffle-assertions");

/**
 * Original source: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/test/lifecycle/Pausable.test.js
 */
describe("Stop", function () {
  const [stopper] = accounts;

  beforeEach(async function () {
    this.stoppable = await StoppableMock.new({ from: stopper });
    await this.stoppable.initialize({ from: stopper });
  });

  it("cannot initialize again", async function () {
    await reverts(
      this.stoppable.initialize({ from: stopper }),
      "Contract instance has already been initialized"
    );
  });

  context("when unstopped", function () {
    beforeEach(async function () {
      expect(await this.stoppable.stopped()).to.equal(false);
    });

    it("can perform normal process in non-stop", async function () {
      expect(await this.stoppable.count()).to.be.bignumber.equal("0");

      await this.stoppable.normalProcess();
      expect(await this.stoppable.count()).to.be.bignumber.equal("1");
    });

    it("cannot take drastic measure in non-stop", async function () {
      await expectRevert(
        this.stoppable.drasticMeasure(),
        "Stoppable: not stopped"
      );
      expect(await this.stoppable.drasticMeasureTaken()).to.equal(false);
    });

    context("when stopped", function () {
      beforeEach(async function () {
        ({ logs: this.logs } = await this.stoppable.stop({ from: stopper }));
      });

      it("emits a Stopped event", function () {
        expectEvent.inLogs(this.logs, "Stopped", { account: stopper });
      });

      it("cannot perform normal process in stop", async function () {
        await expectRevert(
          this.stoppable.normalProcess(),
          "Stoppable: stopped"
        );
      });

      it("can take a drastic measure in a stop", async function () {
        await this.stoppable.drasticMeasure();
        expect(await this.stoppable.drasticMeasureTaken()).to.equal(true);
      });

      it("reverts when re-stopping", async function () {
        await expectRevert(
          this.stoppable.stop({ from: stopper }),
          "Stoppable: stopped"
        );
      });
    });
  });
});
