import * as UniswapV2Factory from '@uniswap/v2-core/build/UniswapV2Factory.json';
import { ContractFactory, JsonRpcProvider, Wallet } from 'ethers';

async function main() {
  const abi = UniswapV2Factory.abi;
  const provider = new JsonRpcProvider(process.env.RPC_URL!);
  const signer = new Wallet(process.env.DEPLOYER_PRIVATE_KEY!).connect(provider);

  const factory = new ContractFactory(abi, UniswapV2Factory.bytecode, signer)

  // Deploy an instance of the contract
  const contract = await factory.deploy("0xf3d63166f0ca56c3c1a3508fce03ff0cf3fb691e");

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  console.log('Contract deployed to:', contractAddress);
}

main().catch(console.error);