import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require('hardhat-deploy');

const config: HardhatUserConfig = {
  defaultNetwork: "cyber",
  networks: {
    cyber: {
      url: "https://rpc.cyber.co"
    }
  },
  blockscout: {
    enabled: true,
    customChains: [
      {
        network: "cyber",
        chainId: 7560,
        urls: {
          apiURL: "https://api.socialscan.io/cyber/v1/explorer/command_api/contract",
          browserURL: "https://cyber.socialscan.io/"
        }
      }
    ]
  },
  solidity: {
    compilers: [{ version: "0.8.24", }],
    overrides: {
      "contracts/CrossChainAccount.sol": {
        version: "0.7.6",
      },
      "contracts/v2-core/UniswapV2Factory.sol": {
        version: "0.5.16",
        settings: {
          optimizer: {
            enabled: true,
            runs: 999999
          }
        }
      },
      "contracts/v2-core/UniswapV2Pair.sol": {
        version: "0.5.16"
      },
      "contracts/v2-core/UniswapV2ERC20.sol": {
        version: "0.5.16"
      },
      "contracts/v2-core/libraries/UQ112x112.sol": {
        version: "0.5.16"
      },
      "contracts/v2-core/libraries/Math.sol": {
        version: "0.5.16"
      },
      "contracts/v2-core/libraries/SafeMath.sol": {
        version: "0.5.16"
      },
    }
  }
};

export default config;
