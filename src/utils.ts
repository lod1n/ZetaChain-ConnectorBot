import { Finding, FindingSeverity, FindingType, Network, getEthersProvider } from "forta-agent";
import { Interface } from "@ethersproject/abi";

const provider = getEthersProvider();

// define abi for events we want to monitor
const CONNECTOR_EVENT_ABI: string[] = [
    "event PauserAddressUpdated(address updaterAddress, address newTssAddress)",
    "event TSSAddressUpdated(address zetaTxSenderAddress, address newTssAddress)",
    "event ZetaReceived(address zetaTxSenderAddress, uint256 sourceChainId, address destinationAddress, unint256 zetaValue, bytes message, bytes32 internalSendHash)",
];
const CONNECTOR_EVENTS_IFACE: Interface = new Interface(CONNECTOR_EVENT_ABI);
const TOKEN_EVENT_ABI: string[] = [
    "event Transfer(address from, address to, uint256 value)",
    "event Burnt(address account, uint256 amount)",
    "event Minted(address mintee, uint256 value, bytes32 internalSendHash)"
];
const TOKEN_EVENTS_IFACE: Interface = new Interface(TOKEN_EVENT_ABI);

interface FindingParams {
    // deposit, minimum deposit and blacklisted address
    alertId: "001" | "002" | "003"; 
    chainId: Network;
    account: string;
    depositedAmount: string;
    description: string;
    severity: FindingSeverity;
    type: FindingType;
  }

const createFinding = ({
    alertId,
    chainId,
    account,
    depositedAmount,
    description,
    severity,
    type,
}: FindingParams): Finding => {
    return Finding.fromObject({
        name: "Detects all deposit transactions",
        description,
        alertId: `deposit-${alertId}`, 
        severity,
        type,
        protocol: "Depositor",
        metadata: {
            account,
            depositedAmount,
            chainId: chainId.toString(),
        },
    });
};

// exports to be used by agent.ts
export default {
    provider,
    CONNECTOR_EVENT_ABI,
    CONNECTOR_EVENTS_IFACE,
    TOKEN_EVENT_ABI,
    TOKEN_EVENTS_IFACE,
    createFinding,
};