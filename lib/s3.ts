import * as AWS from 'aws-sdk';
import { awsConfig } from './aws_retry_config';

export const s3Client = new AWS.S3(awsConfig);
