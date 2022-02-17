import { PASS as pass, result } from './result';
import { describeStateMachine } from '../lib/sfn';

async function stepFunctionToPassBasicTests(stateMachineArn: string) {
  const res = await describeStateMachine(stateMachineArn);

  expect(res.stateMachineArn).toMatch(stateMachineArn);
  expect(res.status).toMatch('ACTIVE');
  expect(res.type).toMatch('STANDARD');

  return result({
    check: pass,
    message: 'Step Function passes basic tests'
  });
}

async function stepFunctionShouldHaveResources(stateMachineArn: string, expectedResourceArns: string[]) {
  const res = await describeStateMachine(stateMachineArn);

  expect(expectedResourceArns.length).toBeGreaterThan(0);

  expectedResourceArns.forEach((arn) => {
    expect(res.definition).toContain(arn);
  });

  return result({
    check: pass,
    message: 'All resource ARNs part of Step Function definition'
  });
}

expect.extend({
  stepFunctionToPassBasicTests,
  stepFunctionShouldHaveResources
});
