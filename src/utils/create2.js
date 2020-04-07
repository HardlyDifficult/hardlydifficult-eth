const Web3Utils = require("web3-utils");

function buildCreate2Address(factoryAddress, saltHex, byteCodeHash) {
  const seed = ["ff", factoryAddress, saltHex, byteCodeHash]
    .map((x) => x.replace(/0x/, ""))
    .join("");
  let address = Web3Utils.keccak256(`0x${seed}`).slice(-40);
  address = Web3Utils.toChecksumAddress(`0x${address}`);
  return address;
}

module.exports = {
  /**
   * @notice Returns the address for a create2 deployment without calling a node (JS only).
   * @param byteCodeHash Web3Utils.sha3(byteCode)
   * @dev This accepts the byteCodeHash instead of byteCode to allow this to work
   * by caching the hash instead of passing the full bytecode each time.
   * Source: https://github.com/miguelmota/solidity-create2-example
   * modified to accept byteCodeHash, return the checksum address, and for readability
   */
  buildCreate2Address,
  /**
   * @notice Returns the address for a create2 deployment of a minimal proxy contract
   * (EIP-1167) without calling a node (JS only).
   * @param salt A value <= 32 bytes and may include the msg.sender's address to prevent frontrunning.
   */
  buildClone2Address: (creatorAddress, templateAddress, salt) => {
    const byteCode = `0x3d602d80600a3d3981f3363d3d373d3d3d363d73${templateAddress.replace(
      /0x/,
      ""
    )}5af43d82803e903d91602b57fd5bf3`;
    const byteCodeHash = Web3Utils.keccak256(byteCode);
    return buildCreate2Address(creatorAddress, salt, byteCodeHash);
  },
};
