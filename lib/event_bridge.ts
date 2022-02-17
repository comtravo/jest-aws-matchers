import { EventBridge } from 'aws-sdk';

export async function getEventPatternByName(name: string) {
  const eventBridge = new EventBridge();

  const { EventPattern } = await eventBridge
    .describeRule({
      Name: name
    })
    .promise();

  return EventPattern;
}
