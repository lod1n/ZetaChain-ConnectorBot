export interface NetworkData {
    connector_address: string; // The smart contract address
    token_address: string;
    minimumDepositAmount: number; 
    blacklistedAddresses: string[];
}
  
// Network config and variables
export const networkData: Record<number, NetworkData> = {
    // Ethereum Goerli
    5: {
      connector_address: "0x00007d0BA516a2bA02D77907d3a1348C1187Ae62",
      token_address: "0xCc7bb2D219A0FC08033E130629C2B854b7bA9195",
      minimumDepositAmount: 0.01,
      blacklistedAddresses: [
        "0x7c71a3d85a8d620eeab9339cce776ddc14a8129c",
        "0x17156c0cf9701b09114cb3619d9f3fd937caa3a8",
        "0xef667f843eb90def43c5587fbf2f8e68165c89bb",
      ],
  },
  
  // Polygon Mumbai
  80001: {
    connector_address: "0x000054d3A0Bc83Ec7808F52fCdC28A96c89F6C5c",
    token_address: "0x000080383847bd75f91c168269aa74004877592f",
    minimumDepositAmount: 0.01,
    blacklistedAddresses: [
      "0x7c71a3d85a8d620eeab9339cce776ddc14a8129c",
      "0x17156c0cf9701b09114cb3619d9f3fd937caa3a8",
      "0xb25a7ba7c6e0dac2e7a685be3986503c12def933",
    ],
  },

    // BSC-Testnet
  97: {
    connector_address: "0x000054d3A0Bc83Ec7808F52fCdC28A96c89F6C5c",
    token_address: "0x000080383847bd75f91c168269aa74004877592f",
    minimumDepositAmount: 0.01,
    blacklistedAddresses: [
      "0x7c71a3d85a8d620eeab9339cce776ddc14a8129c",
      "0x17156c0cf9701b09114cb3619d9f3fd937caa3a8",
      "0xef667f843eb90def43c5587fbf2f8e68165c89bb",
    ],
  },

  // Klaytn Baobab
  1001: {
    connector_address: "0x000054d3A0Bc83Ec7808F52fCdC28A96c89F6C5c",
    token_address: "0x000080383847bd75f91c168269aa74004877592f",
    minimumDepositAmount: 0.01,
    blacklistedAddresses: [
      "0x7c71a3d85a8d620eeab9339cce776ddc14a8129c",
      "0x17156c0cf9701b09114cb3619d9f3fd937caa3a8",
      "0xef667f843eb90def43c5587fbf2f8e68165c89bb",
    ],
  },
};

