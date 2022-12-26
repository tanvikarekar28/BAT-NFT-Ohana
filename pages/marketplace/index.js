import { NftCard, NftList } from "@components/ui/nft";
import { BaseLayout } from "@components/ui/layout";
import { getAllNfts } from "@content/nft/fetcher";
import { useOwnedNfts, useWalletInfo } from "@components/hooks/web3";
import { Button, Loader, Message } from "@components/ui/common";
import { OrderModal } from "@components/ui/order";
import { useState } from "react";
import { MarketHeader } from "@components/ui/marketplace";
import { useWeb3 } from "@components/providers";
import { withToast } from "@utils/toast";

export default function Marketplace({ nfts }) {
  const { web3, contract, requireInstall } = useWeb3();
  const { hasConnectedWallet, isConnecting, account } = useWalletInfo();
  const { ownedNfts } = useOwnedNfts(nfts, account.data);

  const [selectedNft, setSelectedNft] = useState(null);
  const [busyNftId, setBusyNftId] = useState(null);
  const [isNewPurchase, setIsNewPurchase] = useState(true);

  const purchaseNft = async (order, nft) => {
    const hexNftId = web3.utils.utf8ToHex(nft.id);
    const orderHash = web3.utils.soliditySha3(
      { type: "bytes16", value: hexNftId },
      { type: "address", value: account.data }
    );

    const value = web3.utils.toWei(String(order.price));

    setBusyNftId(nft.id);
    if (isNewPurchase) {
      const emailHash = web3.utils.sha3(order.email);
      const proof = web3.utils.soliditySha3(
        { type: "bytes32", value: emailHash },
        { type: "bytes32", value: orderHash }
      );

      withToast(_purchaseNft({ hexNftId, proof, value }, nft));
    } else {
      withToast(_repurchaseNft({ nftHash: orderHash, value }, nft));
    }
  };

  const _purchaseNft = async ({ hexNftId, proof, value }, nft) => {
    try {
      const result = await contract.methods
        .purchaseNft(hexNftId, proof)
        .send({ from: account.data, value });

      ownedNfts.mutate([
        ...ownedNfts.data,
        {
          ...nft,
          proof,
          state: "purchased",
          owner: account.data,
          price: value,
        },
      ]);
      return result;
    } catch (error) {
      throw new Error(error.message);
    } finally {
      setBusyNftId(null);
    }
  };

  const _repurchaseNft = async ({ nftHash, value }, nft) => {
    try {
      const result = await contract.methods
        .repurchaseNft(nftHash)
        .send({ from: account.data, value });

      const index = ownedNfts.data.findIndex((c) => c.id === nft.id);

      if (index >= 0) {
        ownedNfts.data[index].state = "purchased";
        ownedNfts.mutate(ownedNfts.data);
      } else {
        ownedNfts.mutate();
      }
      return result;
    } catch (error) {
      throw new Error(error.message);
    } finally {
      setBusyNftId(null);
    }
  };

  const cleanupModal = () => {
    setSelectedNft(null);
    setIsNewPurchase(true);
  };

  return (
    <>
      <MarketHeader />
      <NftList nfts={nfts}>
        {(nft) => {
          const owned = ownedNfts.lookup[nft.id];
          return (
            <NftCard
              key={nft.id}
              nft={nft}
              state={owned?.state}
              disabled={!hasConnectedWallet}
              Footer={() => {
                if (requireInstall) {
                  return (
                    <Button size="sm" disabled={true} variant="lightPurple">
                      Install
                    </Button>
                  );
                }

                if (isConnecting) {
                  return (
                    <Button size="sm" disabled={true} variant="lightPurple">
                      <Loader size="sm" />
                    </Button>
                  );
                }

                // if (!ownedNfts.hasInitialResponse) {
                //   return (
                //     // <div style={{height: "42px"}}></div>
                //     <Button
                //       variant="white"
                //       // disabled={true}
                //       size="sm"
                //     >
                //       {hasConnectedWallet ? "Loading State..." : "Connect"}
                //     </Button>
                //   );
                // }

                const isBusy = busyNftId === nft.id;
                if (owned) {
                  return (
                    <>
                      <div className="flex">
                        <Button
                          onClick={() => alert("You are owner of this nft.")}
                          disabled={false}
                          size="sm"
                          variant="white"
                        >
                          Yours &#10004;
                        </Button>
                        {owned.state === "deactivated" && (
                          <div className="ml-1">
                            <Button
                              size="sm"
                              disabled={isBusy}
                              onClick={() => {
                                setIsNewPurchase(false);
                                setSelectedNft(nft);
                              }}
                              variant="purple"
                            >
                              {isBusy ? (
                                <div className="flex">
                                  <Loader size="sm" />
                                  <div className="ml-2">In Progress</div>
                                </div>
                              ) : (
                                <div>Fund to Activate</div>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </>
                  );
                }

                return (
                  <Button
                    onClick={() => setSelectedNft(nft)}
                    size="sm"
                    // disabled={!hasConnectedWallet || isBusy}
                    disabled={false}
                    variant="lightPurple"
                  >
                    {isBusy ? (
                      <div className="flex">
                        <Loader size="sm" />
                        <div className="ml-2">In Progress</div>
                      </div>
                    ) : (
                      <div>Purchase</div>
                    )}
                  </Button>
                );
              }}
            />
          );
        }}
      </NftList>
      {selectedNft && (
        <OrderModal
          nft={selectedNft}
          isNewPurchase={isNewPurchase}
          onSubmit={(formData, nft) => {
            purchaseNft(formData, nft);
            cleanupModal();
          }}
          onClose={cleanupModal}
        />
      )}
    </>
  );
}

export function getStaticProps() {
  const { data } = getAllNfts();
  return {
    props: {
      nfts: data,
    },
  };
}

Marketplace.Layout = BaseLayout;
