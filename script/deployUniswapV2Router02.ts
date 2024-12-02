import * as UniswapV2Router02 from '@uniswap/v2-periphery/build/UniswapV2Router02.json';
import { ContractFactory, JsonRpcProvider, Wallet } from 'ethers';

async function main() {
  const abi = UniswapV2Router02.abi;
  const provider = new JsonRpcProvider(process.env.RPC_URL!);
  const signer = new Wallet(process.env.DEPLOYER_PRIVATE_KEY!).connect(provider);

  const factory = new ContractFactory(abi, UniswapV2Router02.bytecode, signer)

  // Deploy an instance of the contract
  const contract = await factory.deploy("0x8AdDa31FE63696Ac64DED7D0Ea208102b1358c44", "0x4200000000000000000000000000000000000006");

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  console.log('Contract deployed to:', contractAddress);
}

main().catch(console.error);