import { Config } from 'aws-sdk';

export const awsConfig = new Config({
  maxRetries: 100,
  retryDelayOptions: {
    base: 1 * 1000,
    customBackoff: (retryCount) => Math.pow(2, retryCount) * 1000
  }
});
