import { generateSQSARN, generateSQSURL, sqsClient, SQSType } from '../lib/sqs';
import { PASS as pass, result } from './result';
import { IAMPolicy } from '../lib/interfaces';

async function sqsBasicTests(queueName: string, sqsType: SQSType) {
  const res = await sqsClient
    .getQueueAttributes({
      QueueUrl: generateSQSURL(queueName, sqsType),
      AttributeNames: ['All']
    })
    .promise();

  const redrivePolicy = JSON.parse(res.Attributes!.RedrivePolicy);
  // Every SQS queue has a dead letter queue  with suffix -dlq
  const dlqArn = generateSQSARN(`${queueName}-dlq`, sqsType);
  expect(redrivePolicy.deadLetterTargetArn).toEqual(dlqArn);
  expect(redrivePolicy.maxReceiveCount).toEqual(12);

  return result({
    check: pass,
    message: 'Passed SQS basic tests'
  });
}

async function sqsToPassBasicTests(queueName: string) {
  return sqsBasicTests(queueName, SQSType.Standard);
}

async function sqsFifoToPassBasicTests(queueName: string) {
  return sqsBasicTests(queueName, SQSType.Fifo);
}

async function sqsToBeTriggeredBySNSTopics(queueName: string, snsTopicArns: string[]) {
  const queueArn = generateSQSARN(queueName);

  const res = await sqsClient
    .getQueueAttributes({
      QueueUrl: generateSQSURL(queueName),
      AttributeNames: ['Policy']
    })
    .promise();

  const queuePolicy = JSON.parse(res.Attributes!.Policy) as IAMPolicy;

  expect(snsTopicArns.length).toBeGreaterThan(0);

  snsTopicArns.forEach((snsTopicArn) => {
    expect(queuePolicy.Statement[0].Condition?.['ForAnyValue:ArnLike']?.['aws:SourceArn']).toContain(snsTopicArn);
  });

  snsTopicArns.forEach(async (snsTopicArn) => {
    await expect(snsTopicArn).snsToHaveSubscriptionWithSqs(queueArn);
  });

  return result({
    check: pass,
    message: 'SQS has policy to be tiggered by all SNS topics'
  });
}

async function sqsToBeFifo(queueName: string) {
  const res = await sqsClient
    .getQueueAttributes({
      QueueUrl: generateSQSURL(queueName, SQSType.Fifo),
      AttributeNames: ['FifoQueue']
    })
    .promise();

  const queuePolicy = JSON.parse(res.Attributes!.FifoQueue);

  expect(queuePolicy).toBe(true);

  return result({
    check: pass,
    message: 'SQS is of FIFO type'
  });
}

expect.extend({
  sqsToPassBasicTests,
  sqsFifoToPassBasicTests,
  sqsToBeTriggeredBySNSTopics,
  sqsToBeFifo
});
