import { awsConfig } from './aws_retry_config';
import { IAM } from 'aws-sdk';

export const iamClient = new IAM(awsConfig);

export function getIAMRoleResponse(IAMRoleName: string) {
  return iamClient
    .getRole({
      RoleName: IAMRoleName
    })
    .promise();
}

export function getIAMRoleAttachedPolicies(IAMRoleName: string) {
  return iamClient
    .getRolePolicy({
      RoleName: IAMRoleName,
      PolicyName: IAMRoleName
    })
    .promise();
}
