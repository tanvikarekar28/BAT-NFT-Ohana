import { createNftHash } from "@utils/hash";
import { normalizeOwnedNft } from "@utils/normalize";
import useSWR from "swr";

export const handler = (web3, contract) => (nfts, account) => {
  const swrRes = useSWR(
    () => (web3 && contract && account ? `web3/ownedNfts/${account}` : null),
    async () => {
      const ownedNfts = [];
      for (let i = 0; i < nfts.length; i++) {
        const nft = nfts[i];

        if (!nft.id) {
          continue;
        }

        const nftHash = createNftHash(web3)(nft.id, account);
        const ownedNft = await contract.methods.getNftByHash(nftHash).call();

        if (ownedNft.owner !== "0x0000000000000000000000000000000000000000") {
          const normalized = normalizeOwnedNft(web3)(nft, ownedNft);
          ownedNfts.push(normalized);
        }
      }

      return ownedNfts;
    }
  );

  return {
    ...swrRes,
    lookup:
      swrRes.data?.reduce((a, c) => {
        a[c.id] = c;
        return a;
      }, {}) ?? {},
  };
};
