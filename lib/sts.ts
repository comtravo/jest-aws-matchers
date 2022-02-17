import { awsConfig } from './aws_retry_config';
import * as AWS from 'aws-sdk'

export const stsClient = new AWS.STS(awsConfig);