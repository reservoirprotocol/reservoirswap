import { network } from 'hardhat';
import * as CrossChainAccount from '../artifacts/contracts/CrossChainAccount.sol/CrossChainAccount.json';
import { ContractFactory, JsonRpcProvider, Wallet } from 'ethers';
const hre = require("hardhat");

async function main() {
    const abi = CrossChainAccount.abi;
    const provider = new JsonRpcProvider(process.env.RPC_URL!);
    const signer = new Wallet(process.env.DEPLOYER_PRIVATE_KEY!).connect(provider);

    const factory = new ContractFactory(abi, CrossChainAccount.bytecode, signer)

    // Deploy an instance of the contract
    const contract = await factory.deploy("0x4200000000000000000000000000000000000007", "0x1a9C8182C09F50C8318d769245beA52c32BE35BC");

    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    console.log('Contract deployed to:', contractAddress);

    // Verify the contract
    await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [
            "0x4200000000000000000000000000000000000007",
            "0x1a9C8182C09F50C8318d769245beA52c32BE35BC"
        ]
    });
}

main().catch(console.error);