import { useBatPrice } from "@components/hooks/useBatPrice";
import { useEffect, useState } from "react";

const useCounter = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setInterval(() => {
      setCount((c) => c + 1);
    }, 1000);
  }, []);
  return count;
};

const SimpleComponent = () => {
  const { bat } = useBatPrice();

  return <h1>Simple Component - {bat.data}</h1>;
};

export default function HooksPage() {
  const { bat } = useBatPrice();

  return (
    <>
      <h1>Hello World - {bat.data}</h1>
      <SimpleComponent />
    </>
  );
}
