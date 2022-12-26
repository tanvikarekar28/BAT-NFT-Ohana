import { useHooks } from "@components/providers/web3";
import { useEffect } from "react";
import { useWeb3 } from "@components/providers";
import { useRouter } from "next/router";

const _isEmpty = (data) => {
  return (
    data == null ||
    data === "" ||
    (Array.isArray(data) && data.length === 0) ||
    (data.constructor === Object && Object.keys(data).length === 0)
  );
};

const enhanceHook = (swrRes) => {
  const { data, error } = swrRes;
  const hasInitialResponse = !!(data || error);
  const isEmpty = hasInitialResponse && _isEmpty(data);

  return {
    ...swrRes,
    isEmpty,
    hasInitialResponse,
  };
};

export const useNetwork = () => {
  const swrRes = enhanceHook(useHooks((hooks) => hooks.useNetwork)());
  return {
    network: swrRes,
  };
};

export const useAccount = () => {
  const swrRes = enhanceHook(useHooks((hooks) => hooks.useAccount)());
  return {
    account: swrRes,
  };
};

export const useAdmin = ({ redirectTo }) => {
  const { account } = useAccount();
  const { requireInstall } = useWeb3();
  const router = useRouter();

  useEffect(() => {
    if (
      requireInstall ||
      (account.hasInitialResponse && !account.isAdmin) ||
      account.isEmpty
    ) {
      router.push(redirectTo);
    }
  }, [account]);

  return { account };
};

export const useOwnedNfts = (...args) => {
  const swrRes = enhanceHook(useHooks((hooks) => hooks.useOwnedNfts)(...args));

  return {
    ownedNfts: swrRes,
  };
};

export const useOwnedNft = (...args) => {
  const swrRes = enhanceHook(useHooks((hooks) => hooks.useOwnedNft)(...args));

  return {
    ownedNft: swrRes,
  };
};

export const useManagedNfts = (...args) => {
  const swrRes = enhanceHook(
    useHooks((hooks) => hooks.useManagedNfts)(...args)
  );

  return {
    managedNfts: swrRes,
  };
};

export const useWalletInfo = () => {
  const { account } = useAccount();
  const { network } = useNetwork();

  const isConnecting =
    !account.hasInitialResponse && !network.hasInitialResponse;

  return {
    account,
    network,
    isConnecting,
    hasConnectedWallet: !!(account.data && network.isSupported),
  };
};
