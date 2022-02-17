import { awsConfig } from './aws_retry_config';
import { CloudWatchLogs } from 'aws-sdk';

export const cloudWatchLogsClient = new CloudWatchLogs(awsConfig);
