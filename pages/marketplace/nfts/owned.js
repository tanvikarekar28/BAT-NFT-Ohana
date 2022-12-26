import { useAccount, useOwnedNfts } from "@components/hooks/web3";
import { Button, Message } from "@components/ui/common";
import { OwnedNftCard } from "@components/ui/nft";
import { BaseLayout } from "@components/ui/layout";
import { MarketHeader } from "@components/ui/marketplace";
import { getAllNfts } from "@content/nft/fetcher";
import { useRouter } from "next/router";
import Link from "next/link";
import { useWeb3 } from "@components/providers";

export default function OwnedNfts({ nfts }) {
  const router = useRouter();
  const { requireInstall } = useWeb3();
  const { account } = useAccount();
  const { ownedNfts } = useOwnedNfts(nfts, account.data);

  return (
    <>
      <MarketHeader />
      <section className="grid grid-cols-1">
        {ownedNfts.isEmpty && (
          <div className="w-1/2">
            <Message type="warning">
              <div>You don&apos;t own any nfts</div>
              <Link href="/marketplace">
                <a className="font-normal hover:underline">
                  <i>Purchase Nft</i>
                </a>
              </Link>
            </Message>
          </div>
        )}
        {account.isEmpty && (
          <div className="w-1/2">
            <Message type="warning">
              <div>Please connect to Metamask</div>
            </Message>
          </div>
        )}
        {requireInstall && (
          <div className="w-1/2">
            <Message type="warning">
              <div>Please install Metamask</div>
            </Message>
          </div>
        )}
        {ownedNfts.data?.map((nft) => (
          <OwnedNftCard key={nft.id} nft={nft}>
            <Button onClick={() => router.push(`/nfts/${nft.slug}`)}>
              Watch the nft
            </Button>
          </OwnedNftCard>
        ))}
      </section>
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

OwnedNfts.Layout = BaseLayout;
