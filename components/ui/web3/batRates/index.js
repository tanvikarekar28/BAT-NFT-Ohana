import { useBatPrice, NFT_PRICE } from "@components/hooks/useBatPrice";
import { Loader } from "@components/ui/common";
import Image from "next/image";

export default function BatRates() {
  const { bat } = useBatPrice();

  return (
    <div
      className="flex flex-col xs:flex-row text-center"
      style={{ marginTop: "10px" }}
    >
      <div className="p-6 border drop-shadow rounded-md mr-2">
        <div className="flex items-center justify-center">
          {bat.data ? (
            <>
              <Image
                layout="fixed"
                height="35"
                width="35"
                src="https://basicattentiontoken.org/static-assets/images/bat-logo.svg"
              />
              <span className="text-xl font-bold">= ${bat.data}</span>
            </>
          ) : (
            <div className="w-full flex justify-center">
              <Loader size="md" />
            </div>
          )}
        </div>
        <p className="text-lg text-gray-500">Current</p>
      </div>
      <div className="p-6 border drop-shadow rounded-md">
        <div className="flex items-center justify-center">
          {bat.data ? (
            <>
              <span className="text-xl font-bold">${NFT_PRICE}&nbsp;</span>
              <span className="text-xl font-bold"> = {bat.perItem}</span>
              <Image
                layout="fixed"
                height="35"
                width="35"
                src="https://basicattentiontoken.org/static-assets/images/bat-logo.svg"
              />
            </>
          ) : (
            <div className="w-full flex justify-center">
              <Loader size="md" />
            </div>
          )}
        </div>
        <p className="text-lg text-gray-500">Price per NFT</p>
      </div>
    </div>
  );
}
