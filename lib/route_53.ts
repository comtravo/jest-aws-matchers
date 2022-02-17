import { awsConfig } from './aws_retry_config';
import { Route53 } from 'aws-sdk';

export const r53Client = new Route53(awsConfig);

export async function getPublicHostedZoneDetails(domain: string) {
  const domainName = domain;
  const res = await r53Client
    .listHostedZonesByName({
      DNSName: domainName,
      MaxItems: '1'
    })
    .promise();

  return res.HostedZones[0];
}

export async function getPrivateHostedZoneDetails(domain: string) {
  const domainName = domain;
  const res = await r53Client.listHostedZones().promise();

  return res.HostedZones.find((hostedZone) => hostedZone.Name.match(domainName));
}

export async function getPublicRecordDetails(params: { recordName: string; recordType: string; domain: string }) {
  const publicHostedZoneDetails = await getPublicHostedZoneDetails(params.domain);

  const res = await r53Client
    .listResourceRecordSets({
      HostedZoneId: publicHostedZoneDetails!.Id,
      StartRecordName: params.recordName,
      StartRecordType: params.recordType,
      MaxItems: '1'
    })
    .promise();

  expect(res.ResourceRecordSets.length).toEqual(1);
  expect(res.ResourceRecordSets![0].Name).toMatch(params.recordName);
  expect(res.ResourceRecordSets![0].Type).toEqual(params.recordType);

  return res.ResourceRecordSets[0];
}

export async function getPrivateRecordDetails(params: { recordName: string; recordType: string; domain: string }) {
  const privateHostedZoneDetails = await getPrivateHostedZoneDetails(params.domain);

  const res = await r53Client
    .listResourceRecordSets({
      HostedZoneId: privateHostedZoneDetails!.Id,
      StartRecordName: params.recordName,
      StartRecordType: params.recordType,
      MaxItems: '1'
    })
    .promise();

  expect(res.ResourceRecordSets.length).toEqual(1);

  return res.ResourceRecordSets[0];
}
