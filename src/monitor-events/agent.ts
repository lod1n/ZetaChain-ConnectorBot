import { Finding, FindingSeverity, FindingType, ethers } from "forta-agent";
import { EventObject, FindingParams } from "../utils";

// build the event object so we can pattern match against the expression.
function getEvents(contractEventConfig, currentContract) {
    let { events } = contractEventConfig;
    const eventInfo: EventObject[] = [];

    let eventNames = Object.keys(events);
    eventNames.forEach((eventName) => {
        const eventObject: EventObject = {
            name: eventName,
            signature: currentContract.iface.getEvent(eventName).format(ethers.utils.FormatTypes.full),
            chainId: events[eventName].Network.toString(),
            type: events[eventName].type,
            severity: events[eventName].severity,
            expression: events[eventName]?.expression && events[eventName].expression,
            expressionObject: events[eventName]?.expression && parseExpression(events[eventName].expression)
        };
        eventInfo.push(eventObject);
    })
    return { eventInfo };
};

// TODO define FindingParams for calling variable
function createFinding({
    eventName,
    contractName,
    contractAddress,
    expression,
    eventType,
    eventSeverity,
    args,
    protocolName, //remove?
    addresses, }: FindingParams
): Finding {
    const eventArgs = extractEventArgs(args);
    const finding = Finding.fromObject({
        name: `${protocolName} Monitor Event`,
        description: `${contractName}: ${eventName} triggered by condition: ${expression}`,
        alertId: `${eventName}-TRIGGER`,
        //type: FindingType[eventType],
        //severity: FindingSeverity[eventSeverity],
        type: eventType,
        severity: eventSeverity,
        protocol: protocolName,
        addresses,
        metadata: {
            contractName,
            contractAddress,
            eventName,
            ...eventArgs,
        },
    });
    return Finding.fromObject(finding);
}

const initialize = async (config) => {
    const botState = { ...config };
    botState.monitorEvents = config.contracts;

    // load interfaces and contract abis
    botState.contracts = Object.entries(botState.monitorEvents).map(([name, entry]) => {
        let abi = getAbi(config.name, entry.abiFile);
        const iface = new ethers.utils.Interface(abi);
        const contract = { name, address: entry.address, iface };
        return contract;
    });

    botState.contracts.forEach((contract) => {
        const entry = botState.monitorEvents[contract.name];
        const { eventInfo } = getEvents(entry, contract);
        contract.eventInfo = eventInfo;
    });

    return botState;
}

const handleTransaction = async (botState, txEvent) => {
    if (!botState.contracts) throw new Error('handleTransaction called before first init');

    const findings: Finding[] = [];
    botState.contracts.forEach((contract) => {
        contract.eventInfo.forEach((ev) => {
            const txLogs = txEvent.filterLog(ev.signature, contract.address);
            
            txLogs.forEach((txLog) => {
                if (ev.expression) {
                    if (!checkLogAgainstExpression(ev.expressionObject, parsedLog)) {
                        return;
                    }
                }

                let addresses = Object.keys(txEvent.addresses).map((address) => address.toLowerCase());
                addresses = addresses.filter((address) => address !== "undefined");

                findings.push(
                    createFinding({
                        eventName: ev.name,
                        eventType: ev.type,
                        eventSeverity: ev.severity,
                        args: txLog.args,
                        protocolName: botState.protocolName,
                        expression: ev.expression,
                        addresses: addresses,
                        contractName: contract.name,
                        contractAddress: contract.address,
                    }
                    ));
            });
        });
    });
    return findings;

};

export default {
    createFinding,
    initialize,
    handleTransaction,
};