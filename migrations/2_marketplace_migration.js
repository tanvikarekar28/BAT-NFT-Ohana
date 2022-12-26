const MarketplaceMigration = artifacts.require("NftMarketplace");

module.exports = function (deployer) {
  deployer.deploy(MarketplaceMigration);
};
