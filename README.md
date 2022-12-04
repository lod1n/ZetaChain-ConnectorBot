# ZetaChain Connector Agent

## Description

This agent monitors potentially malicious use of the ZetaChain ERC20 token and Connector contracts across multiple chains.

## Supported Chains

- Ethereum
- Polygon
- BSC
- Klaytn (direct RPC only)

## Alerts

- CONNECTOR-1

  - Fired when a transaction is detected originating from a blacklisted address
  - Due to the malicious nature of blacklisted addresses:
    - Severity is always set to "high"
    - Type is always set to "suspicious"
  - Currently the blacklist is hardcoded for each chain within `network.ts`

- CONNECTOR-2

  - XXXX

- TOKEN-1

  - Fired when a transaction is detected originating from a blacklisted address
  - Due to the malicious nature of blacklisted addresses:
    - Severity is always set to "high"
    - Type is always set to "suspicious"
  - Currently the blacklist is hardcoded for each chain within `network.ts`

- TOKEN-2
  - XXXX

## Test Data

The agent behaviour can be verified with the following test transactions:
`npm run tx <tx>`

[connector]

- 0x3a0f757030beec55c22cbc545dd8a844cbbb2e6019461769e1bc3f3a95d10826 (15,000 USDT)

[token]

- 0xc93804b3a7b0865ac252f605e45ad777f26b4a82a8afa82ac904fcbac9fb92f6 (large transfer)
