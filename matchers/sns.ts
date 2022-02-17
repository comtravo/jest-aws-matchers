// import { IAMPolicy, Statement } from '../lib/interfaces';
import { PASS as pass, result } from './result';

import { CT_AWS_ACCOUNT_ID } from '../lib/helpers';
import { SNS } from 'aws-sdk';
import { snsClient } from '../lib/sns';
interface EffectiveDeliveryPolicy {
  http: HTTP;
}

interface HTTP {
  defaultHealthyRetryPolicy: DefaultHealthyRetryPolicy;
  disableSubscriptionOverrides: boolean;
}

interface DefaultHealthyRetryPolicy {
  minDelayTarget: number;
  maxDelayTarget: number;
  numRetries: number;
  numMaxDelayRetries: number;
  numNoDelayRetries: number;
  numMinDelayRetries: number;
  backoffFunction: string;
}

// Problem checking subscriptions with SNS

// 1. Create a SNS topic
//  aws sns create-topic --name foo
// {
//     "TopicArn": "arn:aws:sns:eu-west-1:606762362359:foo"
// }

// 2. Create a SQS queue
// aws sqs create-queue --queue-name foo
// {
//     "QueueUrl": "https://eu-west-1.queue.amazonaws.com/606762362359/foo "
// }

// 3. Sunscribe the SQS queue to SNS
// aws sns subscribe --topic-arn arn:aws:sns:eu-west-1:606762362359:foo --protocol sqs --notification-endpoint arn:aws:sqs:eu-west-1:606762362359:foo
// {
//     "SubscriptionArn": "arn:aws:sns:eu-west-1:606762362359:foo:6796e651-75bc-473c-a69d-4c0e2a184ba3"
// }

// 4. Delete the SNS topic
// aws sns delete-topic --topic-arn arn:aws:sns:eu-west-1:606762362359:foo

// 5. Query the SNS subsctiption
// aws sns get-subscription-attributes --subscription-arn arn:aws:sns:eu-west-1:606762362359:foo:6796e651-75bc-473c-a69d-4c0e2a184ba3
// {
//     "Attributes": {
//         "Owner": "606762362359",
//         "RawMessageDelivery": "false",
//         "TopicArn": "arn:aws:sns:eu-west-1:606762362359:foo",
//         "Endpoint": "arn:aws:sqs:eu-west-1:606762362359:foo",
//         "Protocol": "sqs",
//         "PendingConfirmation": "false",
//         "ConfirmationWasAuthenticated": "true",
//         "SubscriptionArn": "arn:aws:sns:eu-west-1:606762362359:foo:6796e651-75bc-473c-a69d-4c0e2a184ba3"
//     }
// }

// Step 5 should have thrown an error because this ARN is not valid anymore as the SNS topic was deleted. However, It returns a valid response.

// Reason:

// When you delete a topic, subscriptions to the topic will not be "deleted" immediately, but become orphans. SNS will periodically clean these orphans, but no guarantee on how long will it be deleted. If you create a new topic with the same topic name before these orphans are cleared up, the new topic will not inherit these orphans. The best practice is always to unsubscribe all the subscriptions prior to remove the topic[1].

// Hope you may find my information useful, thank you.

// [1] Tutorial: Deleting an Amazon SNS Subscription and Topic  - https://docs.aws.amazon.com/sns/latest/dg/sns-tutorial-delete-subscription-topic.html
// When you no longer need a subscription or topic, you must first unsubscribe from the topic before you can delete the topic.

// Solution:

// Instead of calling the get-subscription-attributes method, we should call the list-subscriptions-by-topic method as
// it returns the current state of the SNS subscriptions

async function snsToHaveSubscriptionWithSqs(snsTopicArn: string, sqsTopicArn: string) {
  const res = await snsClient
    .listSubscriptionsByTopic({
      TopicArn: snsTopicArn
    })
    .promise();

  const expectedSubscription: SNS.Subscription = {
    Owner: CT_AWS_ACCOUNT_ID,
    Protocol: 'sqs',
    Endpoint: sqsTopicArn,
    TopicArn: snsTopicArn
  };

  expect(res.Subscriptions!.length).toBeGreaterThan(0);

  expect(res.Subscriptions).arrayOfObjectsToHavePartialObject(expectedSubscription);

  return result({
    check: pass,
    message: 'SNS has a valid subscription with SQS'
  });
}

async function snsToPassBasicSNSTests(snsTopicArn: string) {
  const res = await snsClient
    .getTopicAttributes({
      TopicArn: snsTopicArn
    })
    .promise();

  // const snsIAMPolicy: IAMPolicy = JSON.parse(res.Attributes!.Policy);
  const effectiveDeliveryPolicy: EffectiveDeliveryPolicy = JSON.parse(res.Attributes!.EffectiveDeliveryPolicy);

  // const expectedIAMStatement: Statement = {
  //   Sid: '__default_statement_ID',
  //   Effect: 'Allow',
  //   Principal: {
  //     AWS: '*'
  //   },
  //   Action: [
  //     'SNS:GetTopicAttributes',
  //     'SNS:SetTopicAttributes',
  //     'SNS:AddPermission',
  //     'SNS:RemovePermission',
  //     'SNS:DeleteTopic',
  //     'SNS:Subscribe',
  //     'SNS:ListSubscriptionsByTopic',
  //     'SNS:Publish',
  //     'SNS:Receive'
  //   ],
  //   Resource: snsTopicArn,
  //   Condition: {
  //     StringEquals: {
  //       'AWS:SourceOwner': CT_AWS_ACCOUNT_ID
  //     }
  //   }
  // };

  const expectedEffectiveDeliveryPolicy: EffectiveDeliveryPolicy = {
    http: {
      defaultHealthyRetryPolicy: {
        minDelayTarget: 20,
        maxDelayTarget: 20,
        numRetries: 3,
        numMaxDelayRetries: 0,
        numNoDelayRetries: 0,
        numMinDelayRetries: 0,
        backoffFunction: 'linear'
      },
      disableSubscriptionOverrides: false
    }
  };

  expect(res.Attributes!.Owner).toEqual(CT_AWS_ACCOUNT_ID);
  expect(Number(res.Attributes!.SubscriptionsPending)).toEqual(0);
  expect(Number(res.Attributes!.SubscriptionsConfirmed)).toBeGreaterThan(0);
  // expect(snsIAMPolicy.Statement).arrayOfObjectsToHavePartialObject(expectedIAMStatement);
  expect(effectiveDeliveryPolicy).toMatchObject(expectedEffectiveDeliveryPolicy);

  return result({
    check: pass,
    message: 'SNS has passed basic tests'
  });
}

expect.extend({
  snsToPassBasicSNSTests,
  snsToHaveSubscriptionWithSqs
});
