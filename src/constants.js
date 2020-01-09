const BigNumber = require("bignumber.js");

module.exports = {
  MAX_GAS: 6700000,
  MAX_UINT: new BigNumber(2)
    .pow(256)
    .minus(1)
    .toFixed(),
  ZERO_ADDRESS: "0x0000000000000000000000000000000000000000"
};
