const {
  Finding, FindingSeverity, FindingType, ethers, Network,
} = require('forta-agent');

const {
  getAbi,
  extractEventArgs,
  parseExpression,
  checkLogAgainstExpression,
} = require('../utils');

// get the Array of events for a given contract
function getEvents(contractEventConfig, currentContract, monitorEvents, contracts) {
  let { events } = contractEventConfig;
  const eventInfo = [];

  let eventNames = [];
  eventNames = Object.keys(events);

  eventNames.forEach((eventName) => {
    const eventObject = {
      name: eventName,
      signature: currentContract.iface.getEvent(eventName).format(ethers.utils.FormatTypes.full),
      type: events[eventName].type,
      severity: events[eventName].severity,
    };

    const { expression } = events[eventName];
    if (expression !== undefined) {
      eventObject.expression = expression;
      eventObject.expressionObject = parseExpression(expression);
    }
    eventInfo.push(eventObject);
  });

  return { eventInfo };
}

// helper function to create alerts
function createAlert(
  eventName,
  contractName,
  contractAddress,
  eventType,
  eventSeverity,
  args,
  protocolName,
  expression,
  addresses,
  chainId,
) {
  const eventArgs = extractEventArgs(args);
  const finding = Finding.fromObject({
    name: `${protocolName} Monitor Event`,
    description: `${contractName}: ${eventName} triggered by condition: ${expression}`,
    alertId: `${eventName}-TRIGGER`,
    type: FindingType[eventType],
    severity: FindingSeverity[eventSeverity],
    protocol: protocolName,
    addresses,
    metadata: {
      chainId,
      contractName,
      contractAddress,
      eventName,
      ...eventArgs,
    },
  });

  return Finding.fromObject(finding);
}


const initialize = async (config, abiOverride = null) => {
  const botState = { ...config };
  botState.monitorEvents = config.contracts;

  // load the contract addresses, abis, and ethers interfaces
  botState.contracts = Object.entries(botState.monitorEvents).map(([name, entry]) => {
    let abi;
    if (abiOverride != null) {
      abi = abiOverride[entry.abiFile];
    } else {
      abi = getAbi(config.name, entry.abiFile);
    }
    const iface = new ethers.utils.Interface(abi);

    const contract = { name, address: entry.address, iface };
    return contract;
  });

  botState.contracts.forEach((contract) => {
    const entry = botState.monitorEvents[contract.name];
    const { eventInfo } = getEvents(entry, contract, botState.monitorEvents, botState.contracts);
    // eslint-disable-next-line no-param-reassign
    contract.eventInfo = eventInfo;
  });

  return botState;
};

const handleTransaction = async (botState, txEvent) => {
  if (!botState.contracts) throw new Error('handleTransaction called before first init');

  const findings = [];
  botState.contracts.forEach((contract) => {
    contract.eventInfo.forEach((ev) => {
      const parsedLogs = txEvent.filterLog(ev.signature, contract.address);

      // iterate over each item in parsedLogs and evaluate expressions (if any) given in the
      // configuration file for each Event log, respectively
      parsedLogs.forEach((parsedLog) => {
        // if there is an expression to check, verify the condition before creating an alert
        if (ev.expression !== undefined) {
          if (!checkLogAgainstExpression(ev.expressionObject, parsedLog)) {
            return;
          }
        }

        let addresses = Object.keys(txEvent.addresses).map((address) => address.toLowerCase());
        addresses = addresses.filter((address) => address !== 'undefined');

        findings.push(createAlert(
          ev.name,
          contract.name,
          contract.address,
          ev.type,
          ev.severity,
          parsedLog.args,
          botState.protocolName,
          ev.expression,
          addresses,
          txEvent.network,
        ));
      });
    });
  });

  return findings;
};

module.exports = {
  createAlert,
  initialize,
  handleTransaction,
};
