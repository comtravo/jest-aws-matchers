import { Kinesis } from 'aws-sdk';

export async function getStreamDescriptionByName(name: string) {
  const kinesis = new Kinesis();

  return kinesis
    .describeStream({
      StreamName: name
    })
    .promise();
}
