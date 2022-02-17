import { awsConfig } from './aws_retry_config';
import { Lambda } from 'aws-sdk';

export const lambdaClient = new Lambda(awsConfig);

export function getLambdaFunction(lambdaName: string) {
  return lambdaClient
    .getFunction({
      FunctionName: lambdaName
    })
    .promise();
}
