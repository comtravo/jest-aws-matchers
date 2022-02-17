import * as AWS from 'aws-sdk';
import { awsConfig } from './aws_retry_config';

export const stsClient = new AWS.STS(awsConfig);
