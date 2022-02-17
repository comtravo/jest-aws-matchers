import { awsConfig } from './aws_retry_config';
import { SSM } from 'aws-sdk';

export const sqsClient = new SSM(awsConfig);

// export async function fetchSecretFromParameterStore(parameter: string) {
//   const secretPrefix = CT_ENVIRONMENT.toUpperCase();

//   const res = await sqsClient
//     .getParameter({
//       Name: `${secretPrefix}_${parameter}`,
//       WithDecryption: true
//     })
//     .promise();

//   expect(res.Parameter).toBeDefined();
//   expect(res.Parameter!.Type).toEqual('SecureString');

//   return res;
// }
