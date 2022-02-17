import * as AWS from 'aws-sdk';
import { awsConfig } from './aws_retry_config';

export const firehoseClient = new AWS.Firehose(awsConfig);
