import { useAdmin, useManagedNfts } from "@components/hooks/web3";
import { useWeb3 } from "@components/providers";
import { Button, Message } from "@components/ui/common";
import { NftFilter, ManagedNftCard } from "@components/ui/nft";
import { BaseLayout } from "@components/ui/layout";
import { MarketHeader } from "@components/ui/marketplace";
import { normalizeOwnedNft } from "@utils/normalize";
import { withToast } from "@utils/toast";
import { useEffect, useState } from "react";

const VerificationInput = ({ onVerify }) => {
  const [email, setEmail] = useState("");

  return (
    <div className="flex mr-2 relative rounded-md">
      <input
        value={email}
        onChange={({ target: { value } }) => setEmail(value)}
        type="text"
        name="account"
        id="account"
        className="w-96 focus:ring-indigo-500 shadow-md focus:border-indigo-500 block pl-7 p-4 sm:text-sm border-gray-300 rounded-md"
        placeholder="0x2341ab..."
      />
      <Button
        onClick={() => {
          onVerify(email);
        }}
      >
        Verify
      </Button>
    </div>
  );
};

export default function ManagedNfts() {
  const [proofedOwnership, setProofedOwnership] = useState({});
  const [searchedNft, setSearchedNft] = useState(null);
  const [filters, setFilters] = useState({ state: "all" });
  const { web3, contract } = useWeb3();
  const { account } = useAdmin({ redirectTo: "/marketplace" });
  const { managedNfts } = useManagedNfts(account);

  const verifyNft = (email, { hash, proof }) => {
    if (!email) {
      return;
    }

    const emailHash = web3.utils.sha3(email);
    const proofToCheck = web3.utils.soliditySha3(
      { type: "bytes32", value: emailHash },
      { type: "bytes32", value: hash }
    );

    proofToCheck === proof
      ? setProofedOwnership({
          ...proofedOwnership,
          [hash]: true,
        })
      : setProofedOwnership({
          ...proofedOwnership,
          [hash]: false,
        });
  };

  const changeNftState = async (nftHash, method) => {
    try {
      const result = await contract.methods[method](nftHash).send({
        from: account.data,
      });

      return result;
    } catch (e) {
      throw new Error(e.message);
    }
  };

  const activateNft = async (nftHash) => {
    withToast(changeNftState(nftHash, "activateNft"));
  };

  const deactivateNft = async (nftHash) => {
    withToast(changeNftState(nftHash, "deactivateNft"));
  };

  const searchNft = async (hash) => {
    const re = /[0-9A-Fa-f]{6}/g;

    if (hash && hash.length === 66 && re.test(hash)) {
      const nft = await contract.methods.getNftByHash(hash).call();

      if (nft.owner !== "0x0000000000000000000000000000000000000000") {
        const normalized = normalizeOwnedNft(web3)({ hash }, nft);
        setSearchedNft(normalized);
        return;
      }
    }

    setSearchedNft(null);
  };

  const renderCard = (nft, isSearched) => {
    return (
      <ManagedNftCard key={nft.ownedNftId} isSearched={isSearched} nft={nft}>
        <VerificationInput
          onVerify={(email) => {
            verifyNft(email, {
              hash: nft.hash,
              proof: nft.proof,
            });
          }}
        />
        {proofedOwnership[nft.hash] && (
          <div className="mt-2">
            <Message>Verified!</Message>
          </div>
        )}
        {proofedOwnership[nft.hash] === false && (
          <div className="mt-2">
            <Message type="danger">Wrong Proof!</Message>
          </div>
        )}
        {nft.state === "purchased" && (
          <div className="mt-2">
            <Button onClick={() => activateNft(nft.hash)} variant="green">
              Activate
            </Button>
            <Button onClick={() => deactivateNft(nft.hash)} variant="red">
              Deactivate
            </Button>
          </div>
        )}
      </ManagedNftCard>
    );
  };

  if (!account.isAdmin) {
    return null;
  }

  const filteredNfts = managedNfts.data
    ?.filter((nft) => {
      if (filters.state === "all") {
        return true;
      }

      return nft.state === filters.state;
    })
    .map((nft) => renderCard(nft));

  return (
    <>
      <MarketHeader />
      <NftFilter
        onFilterSelect={(value) => setFilters({ state: value })}
        onSearchSubmit={searchNft}
      />
      <section className="grid grid-cols-1">
        {searchedNft && (
          <div>
            <h1 className="text-2xl font-bold p-5">Search</h1>
            {renderCard(searchedNft, true)}
          </div>
        )}
        <h1 className="text-2xl font-bold p-5">All Nfts</h1>
        {filteredNfts}
        {filteredNfts?.length === 0 && (
          <Message type="warning">No nfts to display</Message>
        )}
      </section>
    </>
  );
}

ManagedNfts.Layout = BaseLayout;
