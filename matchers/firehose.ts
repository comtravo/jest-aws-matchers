import { AWS_ACCOUNT_ID, AWS_REGION } from '../lib/helpers';
import { getIAMRoleAttachedPolicies, getIAMRoleResponse } from '../lib/iam';
import { IAMPolicy, Statement } from '../lib/interfaces';
import { PASS as pass, result } from './result';

import { firehoseClient } from '../lib/firehose';

export async function firehoseToHaveAssumeRolePolicy(params: { firehoseName: string }) {
  const iamRoleResponse = await getIAMRoleResponse(params.firehoseName);

  const actualIAMFirehoseAssumeRolePolicy: IAMPolicy = JSON.parse(
    decodeURIComponent(iamRoleResponse.Role.AssumeRolePolicyDocument as string)
  );
  const expectedIAMFirehoseAssumeRolePolicy: Statement = {
    Action: 'sts:AssumeRole',
    Principal: {
      Service: 'firehose.amazonaws.com'
    },
    Effect: 'Allow',
    Sid: ''
  };

  expect(actualIAMFirehoseAssumeRolePolicy.Statement.length).toEqual(1);

  expect(actualIAMFirehoseAssumeRolePolicy.Statement).arrayOfObjectsToHavePartialObject(
    expectedIAMFirehoseAssumeRolePolicy
  );

  return result({
    check: pass,
    message: 'Firehose has the appropriate Assume Role policy'
  });
}

export async function firehoseToHaveIAMPolicy(params: { iamRoleName: string; s3BucketArn: string }) {
  const iamRoleAttachedPolicies = await getIAMRoleAttachedPolicies(params.iamRoleName);

  const actualIAMFirehoseAttachedPolicy: IAMPolicy = JSON.parse(
    decodeURIComponent(iamRoleAttachedPolicies.PolicyDocument)
  );

  const expectedIAMFirehoseAttachedPolicy: IAMPolicy = {
    Version: '2012-10-17',
    Statement: [
      {
        Sid: '',
        Effect: 'Allow',
        Action: [
          's3:PutObjectAcl',
          's3:PutObject',
          's3:ListBucketMultipartUploads',
          's3:ListBucket',
          's3:GetObject',
          's3:GetBucketLocation',
          's3:AbortMultipartUpload'
        ],
        Resource: [`${params.s3BucketArn}/*`, `${params.s3BucketArn}`]
      },
      {
        Sid: '',
        Effect: 'Allow',
        Action: 'logs:*',
        Resource: `arn:aws:logs:${AWS_REGION}:${AWS_ACCOUNT_ID}:log-group:/aws/kinesisfirehose/${params.iamRoleName}:log-stream:*`
      }
    ]
  };

  expect(actualIAMFirehoseAttachedPolicy).toMatchObject(expectedIAMFirehoseAttachedPolicy);

  return result({
    check: pass,
    message: 'Firehose has the appropriate policies attached'
  });
}

export async function firehoseToPassBasicTests(params: {
  firehoseName: string;
  s3BucketArn: string;
  s3Prefix: string;
}) {
  const res = await firehoseClient
    .describeDeliveryStream({
      DeliveryStreamName: params.firehoseName
    })
    .promise();

  expect(res.DeliveryStreamDescription.DeliveryStreamStatus).toEqual('ACTIVE');
  expect(res.DeliveryStreamDescription.DeliveryStreamARN).toMatch(
    `arn:aws:firehose:${AWS_REGION}:${AWS_ACCOUNT_ID}:deliverystream/${params.firehoseName}`
  );

  const firehoseDestinationConfiguration = res.DeliveryStreamDescription.Destinations;

  expect(firehoseDestinationConfiguration).toHaveLength(1);
  expect(firehoseDestinationConfiguration[0].ExtendedS3DestinationDescription?.BucketARN).toEqual(params.s3BucketArn);
  expect(firehoseDestinationConfiguration[0].ExtendedS3DestinationDescription?.Prefix).toEqual(params.s3Prefix);

  await expect({
    firehoseName: params.firehoseName
  }).firehoseToHaveAssumeRolePolicy();

  await expect({
    iamRoleName: params.firehoseName,
    s3BucketArn: params.s3BucketArn
  }).firehoseToHaveIAMPolicy();

  return result({
    check: pass,
    message: 'Firehose basic tests pass'
  });
}

expect.extend({
  firehoseToPassBasicTests,
  firehoseToHaveIAMPolicy,
  firehoseToHaveAssumeRolePolicy
});
