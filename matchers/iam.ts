import { PASS as pass, result } from './result';

import { iamClient } from '../lib/iam';

export async function iamRoleToHaveBasicPermissionsForLambdaExecution(lambdaIAMRole: string) {
  const iamRoleAttachedPolicies = await iamClient
    .listAttachedRolePolicies({
      RoleName: lambdaIAMRole
    })
    .promise();

  const iamRoleResponse = await iamClient
    .getRole({
      RoleName: lambdaIAMRole
    })
    .promise();

  const vpcLambdaExecutionPolicy = iamRoleAttachedPolicies.AttachedPolicies?.find((attachedPolicy) => {
    return attachedPolicy.PolicyArn === 'arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole';
  });

  const xrayWritePolicy = iamRoleAttachedPolicies.AttachedPolicies?.find((attachedPolicy) => {
    return attachedPolicy.PolicyArn === 'arn:aws:iam::aws:policy/AWSXrayWriteOnlyAccess';
  });

  const iamAssumeRolePolicy = JSON.parse(decodeURIComponent(iamRoleResponse.Role.AssumeRolePolicyDocument as string));

  expect(vpcLambdaExecutionPolicy).toBeDefined();
  expect(xrayWritePolicy).toBeDefined();
  expect(iamAssumeRolePolicy).toMatchObject({
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Principal: {
          Service: 'lambda.amazonaws.com'
        },
        Action: 'sts:AssumeRole'
      }
    ]
  });

  return result({
    check: pass,
    message: 'Lambda IAM Role tests passed'
  });
}

expect.extend({
  iamRoleToHaveBasicPermissionsForLambdaExecution
});
