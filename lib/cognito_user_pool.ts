import * as AWS from 'aws-sdk';

import { awsConfig } from './aws_retry_config';

export const congnitoUserPoolClient = new AWS.CognitoIdentityServiceProvider(awsConfig);

export async function fetchMyComtravoCognitoUserPoolMetadata(userPoolName: string) {
  const response = await congnitoUserPoolClient
    .listUserPools({
      MaxResults: 10
    })
    .promise();

  if (!response.UserPools || response.UserPools.length === 0) {
    throw new Error(`Error listing Cognito user pools: ${JSON.stringify(response)}`);
  }

  const myComtravoUserPoolMetadata = response.UserPools.find((userPoolMetadata) => {
    return userPoolMetadata.Name === userPoolName;
  });

  if (!myComtravoUserPoolMetadata || !myComtravoUserPoolMetadata.Id) {
    throw new Error(
      `Error finding Cognito user pool: ${userPoolName} in cognito user pools: ${JSON.stringify(response)}`
    );
  }

  const userPoolClientResponse = await congnitoUserPoolClient
    .listUserPoolClients({
      UserPoolId: myComtravoUserPoolMetadata.Id
    })
    .promise();

  if (
    !userPoolClientResponse ||
    !userPoolClientResponse.UserPoolClients ||
    userPoolClientResponse.UserPoolClients.length === 0
  ) {
    throw new Error(
      `Error finding Cognito user pool client configuration: ${userPoolName} in cognito user pools: ${JSON.stringify(
        userPoolClientResponse
      )}`
    );
  }

  const userPoolClientConfig = userPoolClientResponse.UserPoolClients[0];

  if (!userPoolClientConfig.UserPoolId || !userPoolClientConfig.ClientId) {
    throw new Error(
      `Error finding Cognito user pool client configuration: ${userPoolName} in cognito user pools: ${JSON.stringify(
        userPoolClientResponse
      )}`
    );
  }

  return {
    jwks: `https://cognito-idp.eu-west-1.amazonaws.com/${userPoolClientConfig.UserPoolId}/.well-known/jwks.json`,
    aud: userPoolClientConfig.ClientId,
    iss: `https://cognito-idp.eu-west-1.amazonaws.com/${userPoolClientConfig.UserPoolId}`,
    clientId: userPoolClientConfig.ClientId,
    userpoolId: userPoolClientConfig.UserPoolId
  };
}
