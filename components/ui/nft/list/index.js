export default function List({ nfts, children }) {
  return (
    <section className="grid md:grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
      {nfts.map((nft) => children(nft))}
    </section>
  );
}
