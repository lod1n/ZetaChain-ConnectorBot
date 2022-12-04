import { Finding, FindingSeverity, FindingType, Network, getEthersProvider } from "forta-agent";
import { ethers } from "forta-agent";
import { BigNumber } from 'bignumber.js';

// ===========
// Helpers
// ===========

// abi's are stored based on the botname to help keep things organised.
function getAbi(botName: string, abiFile: string) { 
  const abiPath = `../abi/${botName}/${abiFile}`;
  const { abi } = require(abiPath);
  return abi;
};

// parses expressions
function parseExpression(expression: string) { 
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

// TODO: checkLogAgainstExpression()
function checkLogAgainstExpression(expressionObject: object, log: object) { 
  console.log("hello");
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
  args: string,
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
