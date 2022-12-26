import { handler as createAccountHook } from "./useAccount";
import { handler as createNetworkHook } from "./useNetwork";
import { handler as createOwnedNftsHook } from "./useOwnedNfts";
import { handler as createOwnedNftHook } from "./useOwnedNft";
import { handler as createManagedNftsHook } from "./useManagedNfts";

export const setupHooks = ({ web3, provider, contract }) => {
  return {
    useAccount: createAccountHook(web3, provider),
    useNetwork: createNetworkHook(web3),
    useOwnedNfts: createOwnedNftsHook(web3, contract),
    useOwnedNft: createOwnedNftHook(web3, contract),
    useManagedNfts: createManagedNftsHook(web3, contract),
  };
};
