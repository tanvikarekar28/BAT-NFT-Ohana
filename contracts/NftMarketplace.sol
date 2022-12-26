// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract NftMarketplace {

  enum State {
    Purchased,
    Activated,
    Deactivated
  }

  struct Nft {
    uint id; // 32
    uint price; // 32
    bytes32 proof; // 32
    address owner; // 20
    State state; // 1
  }

  bool public isStopped = false;

  mapping(bytes32 => Nft) private ownedNfts;

  mapping(uint => bytes32) private ownedNftHash;

  uint private totalOwnedNfts;

  address payable private owner;

  constructor() {
    setContractOwner(msg.sender);
  }

  error InvalidState();

  error NftIsNotCreated();

  error NftHasOwner();

  error SenderIsNotNftOwner();

  error OnlyOwner();

  modifier onlyOwner() {
    if (msg.sender != getContractOwner()) {
      revert OnlyOwner();
    }
    _;
  }

  modifier onlyWhenNotStopped {
    require(!isStopped);
    _;
  }

  modifier onlyWhenStopped {
    require(isStopped);
    _;
  }

  receive() external payable {}

  function withdraw(uint amount)
    external
    onlyOwner
  {
    (bool success, ) = owner.call{value: amount}("");
    require(success, "Transfer failed.");
  }

  function emergencyWithdraw()
    external
    onlyWhenStopped
    onlyOwner
  {
    (bool success, ) = owner.call{value: address(this).balance}("");
    require(success, "Transfer failed.");
  }

  function selfDestruct()
    external
    onlyWhenStopped
    onlyOwner
  {
    selfdestruct(owner);
  }

  function stopContract()
    external
    onlyOwner
  {
    isStopped = true;
  }

  function resumeContract()
    external
    onlyOwner
  {
    isStopped = false;
  }

  function purchaseNft(
    bytes16 nftId, // 0x00000000000000000000000000003130
    bytes32 proof // 0x0000000000000000000000000000313000000000000000000000000000003130
  )
    external
    payable
    onlyWhenNotStopped
  {
    bytes32 nftHash = keccak256(abi.encodePacked(nftId, msg.sender));

    if (hasNftOwnership(nftHash)) {
      revert NftHasOwner();
    }

    uint id = totalOwnedNfts++;

    ownedNftHash[id] = nftHash;
    ownedNfts[nftHash] = Nft({
      id: id,
      price: msg.value,
      proof: proof,
      owner: msg.sender,
      state: State.Purchased
    });
  }

  function repurchaseNft(bytes32 nftHash)
    external
    payable
    onlyWhenNotStopped
  {
    if (!isNftCreated(nftHash)) {
      revert NftIsNotCreated();
    }

    if (!hasNftOwnership(nftHash)) {
      revert SenderIsNotNftOwner();
    }

    Nft storage nft = ownedNfts[nftHash];

    if (nft.state != State.Deactivated) {
      revert InvalidState();
    }

    nft.state = State.Purchased;
    nft.price = msg.value;
  }

  function activateNft(bytes32 nftHash)
    external
    onlyWhenNotStopped
    onlyOwner
  {
    if (!isNftCreated(nftHash)) {
      revert NftIsNotCreated();
    }

    Nft storage nft = ownedNfts[nftHash];

    if (nft.state != State.Purchased) {
      revert InvalidState();
    }

    nft.state = State.Activated;
  }

  function deactivateNft(bytes32 nftHash)
    external
    onlyWhenNotStopped
    onlyOwner
  {
    if (!isNftCreated(nftHash)) {
      revert NftIsNotCreated();
    }

      Nft storage nft = ownedNfts[nftHash];

    if (nft.state != State.Purchased) {
      revert InvalidState();
    }

    (bool success, ) = nft.owner.call{value: nft.price}("");
    require(success, "Transfer failed!");

    nft.state = State.Deactivated;
    nft.price = 0;
  }

  function transferOwnership(address newOwner)
    external
    onlyOwner
  {
    setContractOwner(newOwner);
  }

  function getNftCount()
    external
    view
    returns (uint)
  {
    return totalOwnedNfts;
  }

  function getNftHashAtIndex(uint index)
    external
    view
    returns (bytes32)
  {
    return ownedNftHash[index];
  }

  function getNftByHash(bytes32 nftHash)
    external
    view
    returns (Nft memory)
  {
    return ownedNfts[nftHash];
  }

  function getContractOwner()
    public
    view
    returns (address)
  {
    return owner;
  }

  function setContractOwner(address newOwner) private {
    owner = payable(newOwner);
  }

  function isNftCreated(bytes32 nftHash)
    private
    view
    returns (bool)
  {
    return ownedNfts[nftHash].owner != 0x0000000000000000000000000000000000000000;
  }

  function hasNftOwnership(bytes32 nftHash)
    private
    view
    returns (bool)
  {
    return ownedNfts[nftHash].owner == msg.sender;
  }
}
