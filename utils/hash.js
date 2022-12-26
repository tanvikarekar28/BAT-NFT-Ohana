export const createNftHash = (web3) => (nftId, account) => {
  const hexNftId = web3.utils.utf8ToHex(nftId);
  const nftHash = web3.utils.soliditySha3(
    { type: "bytes16", value: hexNftId },
    { type: "address", value: account }
  );

  return nftHash;
};
