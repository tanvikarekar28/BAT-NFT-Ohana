import useSWR from "swr";

const URL =
  "https://api.coingecko.com/api/v3/coins/basic-attention-token?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false";
export const NFT_PRICE = 15;

const fetcher = async (url) => {
  const res = await fetch(url);
  const json = await res.json();

  return json.market_data.current_price.usd ?? null;
};

export const useBatPrice = () => {
  const { data, ...rest } = useSWR(URL, fetcher, { refreshInterval: 10000 });

  const perItem = (data && (NFT_PRICE / Number(data)).toFixed(6)) ?? null;
  return { bat: { data, perItem, ...rest } };
};
