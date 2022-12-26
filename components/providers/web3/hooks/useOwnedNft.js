import { createNftHash } from "@utils/hash";
import { normalizeOwnedNft } from "@utils/normalize";
import useSWR from "swr";

export const handler = (web3, contract) => (nft, account) => {
  const swrRes = useSWR(
    () => (web3 && contract && account ? `web3/ownedNft/${account}` : null),
    async () => {
      const nftHash = createNftHash(web3)(nft.id, account);
      const ownedNft = await contract.methods.getNftByHash(nftHash).call();

      if (ownedNft.owner === "0x0000000000000000000000000000000000000000") {
        return null;
      }

      return normalizeOwnedNft(web3)(nft, ownedNft);
    }
  );

  return swrRes;
};
