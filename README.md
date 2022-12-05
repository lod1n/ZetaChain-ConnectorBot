# ZetaChain Connector Agent

## Description

This agent monitors potentially malicious use of the ZetaChain ERC20 token and Connector contracts across multiple chains.

## Supported Chains

- Ethereum
- Polygon
- BSC
- Klaytn (direct RPC only)

## Alerts

Alerts are configured in `bot-config.json`

- CONNECTOR-PauserAddressUpdated

  - Fired when the `PauserAddressUpdated` event is emitted.
  - Due to the sensetive nature of this function :
    - Severity is always set to "high"
    - Type is always set to "suspicious"

- CONNECTOR-TSSAddressUpdated

  - XXXX

- TOKEN-BLACKLIST

  - Fired when a transaction is detected originating from a blacklisted address
  - Due to the malicious nature of blacklisted addresses:
    - Severity is always set to "high"
    - Type is always set to "suspicious"

- TOKEN-Transfer
  - Fired when a transfer transaction is detected exceeding the value set in `bot-config.json`
  - The criticality used below can be modified once a reasonable threshold value is agreed.
    - Severity is always set to "info"
    - Type is always set to "info"

## Test Data

The agent behaviour can be verified with the following test transactions:
`npm run tx <tx>`

[token]

- 0xc93804b3a7b0865ac252f605e45ad777f26b4a82a8afa82ac904fcbac9fb92f6 (polygon-mumbai: blacklisted addr, "large" transfer)
- 0x418ccbda8a23f89bd8b3cd6940789a40030190733bddb4f74dd0271f2e2fec1f (ethereum-goerli: "large" transfer)
- 0xa70218683a8d9f81f46d7287c5f00482c2457634b28ca134028a566ad43d483f (BSC-testchain: "large" transfer)
- 0x0af3de6540cd276b1756f8ffbd59884756fb49efcd717b12e9ff86b028d7a98c (Klaytn-Baobab: "large" transfer)
