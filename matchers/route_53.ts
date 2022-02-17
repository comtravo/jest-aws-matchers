import { PASS as pass, result } from './result';
import { getPublicRecordDetails } from '../lib/route_53';

async function r53ToHavePublicAliasRecord(params: { host: string; recordType: string; domain: string }) {
  const recordDetails = await getPublicRecordDetails({
    recordName: params.host,
    recordType: params.recordType,
    domain: params.domain
  });

  expect(recordDetails.Name).toMatch(params.host);
  expect(recordDetails.Type).toEqual(params.recordType);
  expect(recordDetails.AliasTarget!.DNSName).toMatch(/ct-backend-external-/);
  expect(recordDetails.AliasTarget!.HostedZoneId).toBeDefined();

  return result({
    check: pass,
    message: 'Has Route53 Alias entry'
  });
}

expect.extend({
  r53ToHavePublicAliasRecord
});
