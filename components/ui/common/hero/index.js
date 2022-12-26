export default function Hero() {
  return (
    <section className="lg:2/6 text-left my-28">
      <div className="text-6xl font-semibold text-gray-900 leading-none">
        Welcome to the NFT Marketplace
      </div>
      <div className="mt-6 text-xl font-light text-true-gray-500 antialiased">
        Get a physical NFT for every NFT you purchase on the marketplace!
      </div>
      <div className="mt-5 sm:mt-8 flex lg:justify-start">
        <div className="rounded-md shadow">
          <a
            href="#"
            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
          >
            Get started
          </a>
        </div>
      </div>
    </section>
  );
}
