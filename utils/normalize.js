export const NFT_STATES = {
  0: "purchased",
  1: "activated",
  2: "deactivated",
};

export const normalizeOwnedNft = (web3) => (nft, ownedNft) => {
  return {
    ...nft,
    ownedNftId: ownedNft.id,
    proof: ownedNft.proof,
    owned: ownedNft.owner,
    price: web3.utils.fromWei(ownedNft.price),
    state: NFT_STATES[ownedNft.state],
  };
};
