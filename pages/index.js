import { Hero } from "@components/ui/common";
import { NftList, HomeCard } from "@components/ui/nft";
import { BaseLayout } from "@components/ui/layout";
import { getAllNfts } from "@content/nft/fetcher";

export default function Home({ nfts }) {
  return (
    <>
      <Hero />
      <NftList nfts={nfts}>
        {(nft) => <HomeCard key={nft.id} nft={nft} />}
      </NftList>
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

Home.Layout = BaseLayout;
