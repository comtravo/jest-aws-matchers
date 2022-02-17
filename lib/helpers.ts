import { stsClient } from './sts'

export const AWS_REGION = process.env.AWS_REGION ?? 'eu-west-1'
export const AWS_ACCOUNT_ID = await stsClient.getCallerIdentity().promise().then(res => res.Account)