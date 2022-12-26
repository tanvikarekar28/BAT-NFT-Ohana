import { useAccount, useOwnedNft } from "@components/hooks/web3";
import { useWeb3 } from "@components/providers";
import { Message, Modal } from "@components/ui/common";
import { NftHero, Details, Keypoints } from "@components/ui/nft";
import { BaseLayout } from "@components/ui/layout";
import { getAllNfts } from "@content/nft/fetcher";

export default function Nft({ nft }) {
  const { isLoading } = useWeb3();
  const { account } = useAccount();
  const { ownedNft } = useOwnedNft(nft, account.data);
  const nftState = ownedNft.data?.state;
  // const nftState = "deactivated"

  const isLocked =
    !nftState || nftState === "purchased" || nftState === "deactivated";

  return (
    <>
      <div className="py-4">
        <NftHero
          hasOwner={!!ownedNft.data}
          title={nft.title}
          description={nft.description}
          image={nft.coverImage}
        />
      </div>
      <Keypoints points={nft.wsl} />
      {nftState && (
        <div className="max-w-5xl mx-auto">
          {nftState === "purchased" && (
            <Message type="warning">
              Nft is purchased and waiting for the activation. Process can take
              up to 24 hours.
              <i className="block font-normal">
                In case of any questions, please contact info@nftmarketplace.com
              </i>
            </Message>
          )}
          {nftState === "activated" && (
            <Message type="success">
              Enjoy your NFT from the NFT Marketplace.
            </Message>
          )}
          {nftState === "deactivated" && (
            <Message type="danger">
              NFT has been deactivated, due the incorrect purchase data. The
              functionality to claim ownership of the NFT has been temporaly
              disabled.
              <i className="block font-normal">
                Please contact info@nftmarketplace.com
              </i>
            </Message>
          )}
        </div>
      )}
      <Details isLoading={isLoading} locked={isLocked} nftState={nftState} />
      <Modal />
    </>
  );
}

export function getStaticPaths() {
  const { data } = getAllNfts();

  return {
    paths: data.map((c) => ({
      params: {
        slug: c.slug,
      },
    })),
    fallback: false,
  };
}

export function getStaticProps({ params }) {
  const { data } = getAllNfts();
  const nft = data.filter((c) => c.slug === params.slug)[0];

  return {
    props: {
      nft,
    },
  };
}

Nft.Layout = BaseLayout;
