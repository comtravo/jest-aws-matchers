import { awsConfig } from './aws_retry_config';
import { SQS } from 'aws-sdk';

export const enum SQSType {
  Standard = 'standard',
  Fifo = 'fifo'
}

export const sqsClient = new SQS(awsConfig);

export function generateSQSURL(queueName: string, sqsType: SQSType = SQSType.Standard) {
  let url = `https://sqs.${AWS_REGION}.amazonaws.com/${CT_AWS_ACCOUNT_ID}/${queueName}`;

  if (sqsType === SQSType.Fifo) {
    url += '.fifo';
  }

  return url;
}

export function generateSQSARN(queueName: string, sqsType: SQSType = SQSType.Standard) {
  let arn = `arn:aws:sqs:${AWS_REGION}:${CT_AWS_ACCOUNT_ID}:${queueName}`;

  if (sqsType === SQSType.Fifo) {
    arn += '.fifo';
  }

  return arn;
}
