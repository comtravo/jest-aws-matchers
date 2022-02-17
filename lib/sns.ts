import * as AWS from 'aws-sdk';

import { AWS_ACCOUNT_ID } from './helpers';
import { awsConfig } from './aws_retry_config';

// import { IAMPolicy } from './interfaces';

// function generateExpectedSNSPolicyForArn(topicArn: string): IAMPolicy {
//   return {
//     Version: '2008-10-17',
//     Id: '__default_policy_ID',
//     Statement: [
//       {
//         Sid: '__default_statement_ID',
//         Effect: 'Allow',
//         Principal: {
//           AWS: '*'
//         },
//         Action: [
//           'SNS:GetTopicAttributes',
//           'SNS:SetTopicAttributes',
//           'SNS:AddPermission',
//           'SNS:RemovePermission',
//           'SNS:DeleteTopic',
//           'SNS:Subscribe',
//           'SNS:ListSubscriptionsByTopic',
//           'SNS:Publish',
//           'SNS:Receive'
//         ],
//         Resource: topicArn,
//         Condition: {
//           StringEquals: {
//             'AWS:SourceOwner': CT_AWS_ACCOUNT_ID
//           }
//         }
//       }
//     ]
//   };
// }

export const snsClient = new AWS.SNS(awsConfig);

export async function basicSNSTests(topicArn: string) {
  const snsDeliveryPolicy = {
    http: {
      defaultHealthyRetryPolicy: {
        maxDelayTarget: 20,
        backoffFunction: 'linear',
        numRetries: 3,
        minDelayTarget: 20,
        numNoDelayRetries: 0,
        numMinDelayRetries: 0,
        numMaxDelayRetries: 0
      },
      disableSubscriptionOverrides: false
    }
  };

  const res = await snsClient
    .getTopicAttributes({
      TopicArn: topicArn
    })
    .promise();

  if (!res.Attributes) {
    throw new Error(`invalid response: ${res}`);
  }

  expect(res.Attributes?.Owner).toEqual(AWS_ACCOUNT_ID);
  expect(res.Attributes?.SubscriptionsDeleted).toEqual('0');
  expect(res.Attributes?.SubscriptionsPending).toEqual('0');
  expect(res.Attributes?.TopicArn).toEqual(topicArn);

  // const snsPolicy = JSON.parse(res.Attributes?.Policy);
  // const expectedSNSPolicy = generateExpectedSNSPolicyForArn(topicArn);

  // expect(snsPolicy).toEqual(expectedSNSPolicy);

  const effectiveDeliveryPolicy = JSON.parse(res.Attributes?.EffectiveDeliveryPolicy);

  expect(effectiveDeliveryPolicy).toEqual(snsDeliveryPolicy);

  return res;
}
