import { APIGateway } from 'aws-sdk';
import { awsConfig } from './aws_retry_config';

export const apiGatewayClient = new APIGateway(awsConfig);
