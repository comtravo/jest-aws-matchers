/* eslint-disable @typescript-eslint/no-explicit-any */
import { printExpected, printReceived } from 'jest-matcher-utils';

interface Result {
  check: boolean;
  message: string;
  expected?: any;
  actual?: any;
}

export function result(resultConfig: Result) {
  if (resultConfig.expected) {
    resultConfig.message = `${resultConfig.message}
    ${printExpected(resultConfig.expected)}`;
  }

  if (resultConfig.actual) {
    resultConfig.message = `${resultConfig.message}
    ${printReceived(resultConfig.actual)}`;
  }

  return {
    message: () => resultConfig.message,
    pass: resultConfig.check
  };
}

export const PASS = true;
export const FAIL = false;
