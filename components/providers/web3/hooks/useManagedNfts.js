import { normalizeOwnedNft } from "@utils/normalize";
import useSWR from "swr";

export const handler = (web3, contract) => (account) => {
  const swrRes = useSWR(
    () =>
      web3 && contract && account.data && account.isAdmin
        ? `web3/managedNfts/${account.data}`
        : null,
    async () => {
      const nfts = [];
      const nftCount = await contract.methods.getNftCount().call();

      for (let i = Number(nftCount) - 1; i >= 0; i--) {
        const nftHash = await contract.methods.getNftHashAtIndex(i).call();
        const nft = await contract.methods.getNftByHash(nftHash).call();

        if (nft) {
          const normalized = normalizeOwnedNft(web3)({ hash: nftHash }, nft);
          nfts.push(normalized);
        }
      }

      return nfts;
    }
  );

  return swrRes;
};
