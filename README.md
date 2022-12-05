# ZetaChain Connector Agent

## Description

This agent monitors potentially malicious use of the ZetaChain ERC20 token and Connector contracts across multiple chains.

## Supported Chains

- Ethereum
- Polygon
- BSC
- Klaytn (direct RPC only)

## Alerts

- CONNECTOR-BLACKLIST

  - Fired when any event transaction is detected when originating from 5or being sent to a blacklisted address
  - Due to the malicious nature of blacklisted addresses:
    - Severity is always set to "high"
    - Type is always set to "suspicious"

- CONNECTOR-2

  - XXXX

- TOKEN-BLACKLIST

  - Fired when a transaction is detected originating from a blacklisted address
  - Due to the malicious nature of blacklisted addresses:
    - Severity is always set to "high"
    - Type is always set to "suspicious"

- TOKEN-LARGETRANSFER
  - Fired when a transfer transaction is detected exceeding the value set in `bot-config.json`
  - The criticality used below can be modified once a reasonable threshold value is agreed.
    - Severity is always set to "info"
    - Type is always set to "info"

## Test Data

The agent behaviour can be verified with the following test transactions:
`npm run tx <tx>`

[connector]

- xxxx

[token]

- 0xc93804b3a7b0865ac252f605e45ad777f26b4a82a8afa82ac904fcbac9fb92f6 (large transfer)
