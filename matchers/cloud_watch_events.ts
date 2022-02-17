import { PASS as pass, result } from './result';

import { CloudWatchEvents } from 'aws-sdk';
import { cloudWatchEventsClient } from '../lib/cloud_watch_events';

async function cloudWatchEventsRuleToExistWithScheduleExpression(
  cloudWatchEventRuleName: string,
  scheduleExpression: string
) {
  const res = await cloudWatchEventsClient
    .describeRule({
      Name: cloudWatchEventRuleName
    })
    .promise();

  expect(res.Name).toMatch(cloudWatchEventRuleName);
  expect(res.ScheduleExpression).toMatch(scheduleExpression);
  expect(res.State).toEqual('ENABLED');

  return result({
    check: pass,
    message: 'CloudWatchEvents Rule passes basic tests'
  });
}

async function cloudWatchEventsRuleToTriggerTargetWithInputJson(
  cloudWatchEventRule: {
    Name: string;
    Input: string;
  },
  targetArn: string
) {
  const res = await cloudWatchEventsClient
    .listTargetsByRule({
      Rule: cloudWatchEventRule.Name
    })
    .promise();

  expect(res.Targets!.length).toBeGreaterThan(0);

  const allTargets: CloudWatchEvents.Target[] = res.Targets!.map((target) => {
    expect(target.Input).toBeDefined();

    target.Input = JSON.parse(target.Input as string);

    return target;
  });

  expect(allTargets.length).toBeGreaterThan(0);
  expect(allTargets).arrayOfObjectsToHavePartialObject({
    Arn: targetArn,
    Input: cloudWatchEventRule.Input
  });

  return result({
    check: pass,
    message: `CloudWatchEvents Rule triggers target: ${targetArn}`
  });
}

async function cloudWatchEventsRuleToTriggerTarget(cloudWatchEventRuleName: string, targetArn: string) {
  const res = await cloudWatchEventsClient
    .listTargetsByRule({
      Rule: cloudWatchEventRuleName
    })
    .promise();

  expect(res.Targets!.length).toBeGreaterThan(0);
  expect(res.Targets).arrayOfObjectsToHavePartialObject({
    Arn: targetArn
  });

  return result({
    check: pass,
    message: `CloudWatchEvents Rule triggers target: ${targetArn}`
  });
}

expect.extend({
  cloudWatchEventsRuleToExistWithScheduleExpression,
  cloudWatchEventsRuleToTriggerTarget,
  cloudWatchEventsRuleToTriggerTargetWithInputJson
});
