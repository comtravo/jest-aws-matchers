import { awsConfig } from './aws_retry_config';
import { CloudWatchEvents } from 'aws-sdk';

export const cloudWatchEventsClient = new CloudWatchEvents(awsConfig);
