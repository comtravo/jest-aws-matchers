import { awsConfig } from './aws_retry_config';

import { StepFunctions } from 'aws-sdk';

export const sfnClient = new StepFunctions(awsConfig);

export function describeStateMachine(stateMachineArn: string) {
  return sfnClient
    .describeStateMachine({
      stateMachineArn: stateMachineArn
    })
    .promise();
}
