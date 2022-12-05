import { Finding, FindingSeverity, FindingType, Network, getEthersProvider } from "forta-agent";
import { ethers } from "forta-agent";
import { BigNumber } from 'bignumber.js';

// ===========
// Helpers
// ===========

// abi's are stored based on the botname to help keep things organised.
export function getAbi(botName: string, abiFile: any) { 
  const abiPath = `../abi/${botName}/${abiFile}`;
  const { abi } = require(abiPath);
  return abi;
};

// parses expressions
export function parseExpression(expression: string) { 
  const subStr = expression.split(/(\s+)/).filter((str) => str.trim().length > 0);

  if (subStr.length !== 3) {
    throw new Error("Expression requires: variable operand value")
  }
  const [variableName, operator, value] = subStr;

   // Address
   if (isAddress(value)) {
    // Check the operator
    if (['===', '!=='].indexOf(operator) === -1) {
      throw new Error(`Unsupported address operator "${operator}": must be "===" or "!=="`);
    }
    return {
      variableName,
      operator,
      comparisonFunction: addressComparison,
      value: value.toLowerCase(),
    };
  }

  // Boolean
  if ((value.toLowerCase() === 'true') || (value.toLowerCase() === 'false')) {
    // Check the operator
    if (['===', '!=='].indexOf(operator) === -1) {
      throw new Error(`Unsupported Boolean operator "${operator}": must be "===" or "!=="`);
    }
    return {
      variableName,
      operator,
      comparisonFunction: booleanComparison,
      value: value.toLowerCase() === 'true',
    };
  }

  // Number
  if (isNumeric(value)) {
    // Check the operator
    if (['<', '<=', '===', '!==', '>=', '>'].indexOf(operator) === -1) {
      throw new Error(`Unsupported BN operator "${operator}": must be <, <=, ===, !==, >=, or >`);
    }
    return {
      variableName,
      operator,
      comparisonFunction: bigNumberComparison,
      value: new BigNumber(value),
    };
  }

  // Unhandled
  throw new Error(`Unsupported string specifying value: ${value}`);
};

// pulls strings from the args array returned by the log parser
// weird hack to get the args, still better than args/2
interface Args {
  [key: string]: any;
};

export function extractEventArgs(args: Args): string[] {
  const eventArgs: string[] = [];
  Object.keys(args).forEach((key) => {
    if (Number.isNaN(Number(key))) {
      eventArgs.push(args[key].toString());
    }
  });
  return eventArgs;
};

export function checkLogAgainstExpression(expressionObject: any, log: any) { 
  const {
    variableName: argName, operator, comparisonFunction, value: operand,
  } = expressionObject;

  if (log.args[argName] === undefined) {
    // passed-in argument name from config file was not found in the log, which means that the
    // user's argument name does not coincide with the names of the event ABI
    const logArgNames = Object.keys(log.args);
    throw new Error(`Argument name ${argName} does not match any of the arguments found in an ${log.name} log: ${logArgNames}`);
  }

  // convert the value of argName and the operand value into their corresponding types
  // we assume that any value prefixed with '0x' is an address as a hex string, otherwise it will
  // be interpreted as an ethers BigNumber
  let argValue = log.args[argName];

  // Check if the operand type is BigNumber
  if (BigNumber.isBigNumber(operand)) {
    argValue = new BigNumber(argValue.toString());
  }

  return comparisonFunction(argValue, operator, operand);
};

// ===========
// Helpers
// ===========

function isNumeric(valueString: string) {
  const result = new BigNumber(valueString);
  return !(result.isNaN());
};

function isAddress(valueString: string) {
  return ethers.utils.isHexString(valueString, 20);
};

function addressComparison(variable: string, operator: string, operand: string) {
  switch (operator) {
    case '===':
      return variable.toLowerCase() === operand.toLowerCase();
    case '!==':
      return variable.toLowerCase() !== operand.toLowerCase();
    default:
      throw new Error(`Address operator ${operator} not supported`);
  }
};

function booleanComparison(variable: string, operator: string, operand: string) {
  switch (operator) {
    case '===':
      return variable === operand;
    case '!==':
      return variable !== operand;
    default:
      throw new Error(`Boolean operator ${operator} not supported`);
  }
};

function bigNumberComparison(variable: BigNumber, operator: string, operand: string) {
  switch (operator) {
    case '===':
      return variable.eq(operand);
    case '!==':
      return !(variable.eq(operand));
    case '>=':
      return variable.gte(operand);
    case '>':
      return variable.gt(operand);
    case '<=':
      return variable.lte(operand);
    case '<':
      return variable.lt(operand);
    default:
      throw new Error(`BigNumber operator ${operator} not supported`);
  }
};

// ===========
// Interfaces
// ===========
export interface EventObject {
  name: string; 
  //description: string;
  //alertId: string;
  chainId: Network;
  type: FindingType;
  severity: FindingSeverity;
  signature: string;
  //protocol: string;
  expression: string;
  expressionObject: string;
}

export interface FindingParams {
  eventName: string,
  contractName: string,
  contractAddress: string,
  expression: string,
  eventType: FindingType,
  eventSeverity: FindingSeverity,
  args: Args,
  protocolName: string, //remove?
  addresses: string[],
}

export default {
  getAbi,
  parseExpression,
  extractEventArgs,
  checkLogAgainstExpression,
  isNumeric,
  isAddress,
}
