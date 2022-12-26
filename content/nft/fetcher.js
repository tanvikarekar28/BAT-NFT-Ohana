import nfts from "./index.json";

export const getAllNfts = () => {
  return {
    data: nfts,
    nftMap: nfts.reduce((a, c, i) => {
      a[c.id] = c;
      a[c.id].index = i;
      return a;
    }, {}),
  };
};
