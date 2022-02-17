import { PASS as pass, result } from './result';

import { S3 } from 'aws-sdk';
import { s3Client } from '../lib/s3';

async function s3ToHaveNoPublicAcl(bucketName: string) {
  const res = await s3Client
    .getPublicAccessBlock({
      Bucket: bucketName
    })
    .promise();

  const expectedS3PublicAccessBlockConfiguration: S3.PublicAccessBlockConfiguration = {
    BlockPublicAcls: true,
    IgnorePublicAcls: true,
    BlockPublicPolicy: true,
    RestrictPublicBuckets: true
  };

  expect(res.PublicAccessBlockConfiguration).toMatchObject(expectedS3PublicAccessBlockConfiguration);

  return result({
    check: pass,
    message: 'S3 bucket has no public acl configuration'
  });
}

async function s3ToPassBasicTests(bucketName: string) {
  await expect(bucketName).s3ToHaveNoPublicAcl();
  await expect(bucketName).s3ToBeEncrypted();
  await expect(bucketName).s3ToHaveCorrectObjectOwnership();

  return result({
    check: pass,
    message: 'S3 bucket pass basic tests'
  });
}

async function s3ToBeEncrypted(bucketName: string) {
  const res = await s3Client
    .getBucketEncryption({
      Bucket: bucketName
    })
    .promise();

  expect(res.ServerSideEncryptionConfiguration!.Rules[0].ApplyServerSideEncryptionByDefault!.SSEAlgorithm).toEqual(
    'AES256'
  );

  return result({
    check: pass,
    message: 'S3 bucket is encrypted'
  });
}

async function s3ToHaveCorrectObjectOwnership(bucketName: string) {
  const res = await s3Client
    .getBucketOwnershipControls({
      Bucket: bucketName
    })
    .promise();

  expect(res.OwnershipControls!.Rules[0].ObjectOwnership).toEqual('BucketOwnerPreferred');

  return result({
    check: pass,
    message: 'S3 bucket has correct object ownership'
  });
}

expect.extend({
  s3ToPassBasicTests,
  s3ToHaveNoPublicAcl,
  s3ToBeEncrypted,
  s3ToHaveCorrectObjectOwnership
});
