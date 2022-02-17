import { PASS as pass, result } from './result';
import { cloudWatchLogsClient } from '../lib/cloud_watch_logs';

async function cloudwatchLogGroupToHaveSubscriptionToLambda(
  cloudwatchLogGroupName: string,
  subscriptionConfig: {
    destinationArn: string;
    filterPattern: string;
  }
) {
  const res = await cloudWatchLogsClient
    .describeSubscriptionFilters({
      logGroupName: cloudwatchLogGroupName
    })
    .promise();

  expect(res.subscriptionFilters?.length).toEqual(1);
  expect(res.subscriptionFilters![0].destinationArn).toEqual(subscriptionConfig.destinationArn);
  expect(res.subscriptionFilters![0].filterPattern).toEqual(subscriptionConfig.filterPattern);

  return result({
    check: pass,
    message: 'CloudWatchLogs subscription tetss passed'
  });
}

expect.extend({
  cloudwatchLogGroupToHaveSubscriptionToLambda
});
