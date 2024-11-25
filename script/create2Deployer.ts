import {
  ethers,
  JsonRpcProvider,
  Wallet,
  keccak256,
  solidityPacked
} from 'ethers';

export class Create2Deployer {
  private provider: JsonRpcProvider;
  private signer: Wallet;

  constructor(rpcUrl: string, privateKey: string) {
    this.provider = new JsonRpcProvider(rpcUrl);
    this.signer = new Wallet(privateKey, this.provider);
  }

  // Generate CREATE2 address
  computeAddress(
    factoryAddress: string,
    bytecode: string,
    salt: string,
    constructorArgs: any[] = []
  ): string {
    const sanitizedBytecode = bytecode.startsWith('0x') ? bytecode : `0x${bytecode}`;

    // Encode constructor arguments
    const encodedConstructorArgs = constructorArgs.length > 0
      ? ethers.AbiCoder.defaultAbiCoder().encode(
        this.getConstructorParamTypes(constructorArgs),
        constructorArgs
      ).slice(2) // Remove '0x' prefix from encoded args
      : '';

    // Combine bytecode with constructor args
    const bytecodeWithArgs = sanitizedBytecode + encodedConstructorArgs;

    // Compute CREATE2 address
    const create2Hash = keccak256(
      solidityPacked(
        ['bytes1', 'address', 'bytes32', 'bytes32'],
        [
          '0xff',
          factoryAddress,
          salt,
          keccak256(bytecodeWithArgs)
        ]
      )
    );

    // Last 20 bytes of the hash
    return `0x${create2Hash.slice(-40)}`;
  }

  // Deploy contract using CREATE2
  async deployWithCreate2(
    bytecode: string,
    salt: string,
    constructorArgs: any[] = []
  ) {
    // Create CREATE2 factory contract
    const create2Factory = new ethers.Contract(
      '0x4e59b44847b379578588920cA78FbF26c0B4956C', // Create2 Factory address
      [
        'function deploy(bytes memory _initCode, bytes32 _salt) public returns (address)'
      ],
      this.signer
    );

    try {
      const sanitizedBytecode = bytecode.startsWith('0x') ? bytecode : `0x${bytecode}`;

      // Encode constructor arguments
      const encodedConstructorArgs = constructorArgs.length > 0
        ? ethers.AbiCoder.defaultAbiCoder().encode(
          this.getConstructorParamTypes(constructorArgs),
          constructorArgs
        ).slice(2) // Remove '0x' prefix from encoded args
        : '';

      // Combine bytecode with constructor args
      const initCode = sanitizedBytecode + encodedConstructorArgs;

      // Deploy transaction
      const tx = await create2Factory.deploy(initCode, salt);
      const receipt = await tx.wait();

      // Extract deployed contract address from logs
      const deployedAddress = receipt?.logs[0]?.args?.[0];

      return {
        address: deployedAddress,
        transactionHash: tx.hash
      };

    } catch (error) {
      console.error('CREATE2 Deployment Error:', error);
      throw error;
    }
  }

  // Utility to get constructor param types
  private getConstructorParamTypes(args: any[]): string[] {
    return args.map(arg => {
      if (typeof arg === 'number') return 'uint256';
      if (typeof arg === 'string') {
        // Check if the string looks like an Ethereum address
        if (/^(0x)?[0-9a-fA-F]{40}$/.test(arg)) return 'address';
        return 'string';
      }
      if (typeof arg === 'boolean') return 'bool';
      return 'bytes';
    });
  }

  // Check if contract exists at predicted address
  async isContractDeployed(predictedAddress: string): Promise<boolean> {
    const code = await this.provider.getCode(predictedAddress);
    return code !== '0x';
  }
}