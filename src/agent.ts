import { NetworkManager } from "forta-agent-tools";
import { ethers, Finding, FindingSeverity, FindingType, HandleTransaction, LogDescription, TransactionEvent } from "forta-agent";
import { NetworkData, networkData } from "./network";
import utils from "./utils";

const networkManager = new NetworkManager(networkData); // import the multi-chain network profile

export const provideInitialize = (
  provider: ethers.providers.JsonRpcProvider
) => {
   // "should" return a function that will be used by the Bot
  return async () => {
    await networkManager.init(provider);
  };
};

export const provideHandleTransaction =
  (networkManager: NetworkManager<NetworkData>): HandleTransaction =>
  async (txEvent: TransactionEvent) => {
    const findings: Finding[] = [];
      
    // --
    //    Setup contract functions to watch
    // --
    const connectorLogs = txEvent.filterLog(
      utils.CONNECTOR_EVENT_ABI,
      networkManager.get("connector_address")
    );
    const tokenLogs = txEvent.filterLog(
        utils.TOKEN_EVENT_ABI,
        networkManager.get("token_address")
    );

    // --
    //    Parse connector contract tx's
    // --
    console.log(connectorLogs);
    console.log(tokenLogs);
    connectorLogs.forEach((log: LogDescription) => {
      const amount = ethers.utils.formatEther(log.args.amount);
      // Emit finding for new deposit
      findings.push(
        utils.createFinding({
          alertId: "001",
          chainId: txEvent.network,
          account: txEvent.transaction.from,
          depositedAmount: amount,
          description: "New deposit!",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
        })
      );
      // Emit finding if deposit less than the minimum amount
      if (Number(amount) > networkManager.get("minimumDepositAmount")) {
        findings.push(
          utils.createFinding({
            alertId: "002",
            chainId: txEvent.network,
            account: txEvent.transaction.from,
            depositedAmount: amount,
            description: "Someone deposited a very small amount",
            severity: FindingSeverity.Medium,
            type: FindingType.Suspicious,
          })
        );
      }
      // Emit finding for blacklisted addresses
      if (
        networkManager
          .get("blacklistedAddresses")
          .includes(txEvent.transaction.from)
      ) {
        findings.push(
          utils.createFinding({
            alertId: "003",
            chainId: txEvent.network,
            account: txEvent.transaction.from,
            depositedAmount: amount,
            description: "Blacklisted addresses deposit!",
            severity: FindingSeverity.Critical,
            type: FindingType.Exploit,
          })
        );
      }
    });
      
    // --
    //    Parse token contract tx's 
    // --
     tokenLogs.forEach((log: LogDescription) => {
        const amount = ethers.utils.formatEther(log.args.amount);
        // Emit finding for new deposit
        findings.push(
          utils.createFinding({
            alertId: "001",
            chainId: txEvent.network,
            account: txEvent.transaction.from,
            depositedAmount: amount,
            description: "New deposit!",
            severity: FindingSeverity.Low,
            type: FindingType.Info,
          })
        );
        // Emit finding if deposit less than the minimum amount
        if (Number(amount) > networkManager.get("minimumDepositAmount")) {
          findings.push(
            utils.createFinding({
              alertId: "002",
              chainId: txEvent.network,
              account: txEvent.transaction.from,
              depositedAmount: amount,
              description: "Someone deposited a very small amount",
              severity: FindingSeverity.Medium,
              type: FindingType.Suspicious,
            })
          );
        }
        // Emit finding for blacklisted addresses
        if (
          networkManager
            .get("blacklistedAddresses")
            .includes(txEvent.transaction.from)
        ) {
          findings.push(
            utils.createFinding({
              alertId: "003",
              chainId: txEvent.network,
              account: txEvent.transaction.from,
              depositedAmount: amount,
              description: "Blacklisted addresses deposit!",
              severity: FindingSeverity.Critical,
              type: FindingType.Exploit,
            })
          );
        }
      });
    return findings;
  };

    
export default {
  initialize: provideInitialize(utils.provider),
  handleTransaction: provideHandleTransaction(networkManager),
};