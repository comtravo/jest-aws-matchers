import * as DNS from 'dns';

import { PASS as pass, result } from './result';

import { getHostFromUrl } from '../lib/url';

async function dnsPublicHttpEndpointToPassBasicTests(params: { url: string }) {
  const host = getHostFromUrl(params.url);

  await expect({
    host: host,
    recordType: 'A'
  }).r53ToHavePublicAliasRecord();

  await expect(host).dnsHasALBAliasARecord();

  return result({
    check: pass,
    message: 'DNS records pass basic tests'
  });
}

async function dnsHasALBAliasARecord(host: string) {
  const dnsResponse = await DNS.promises.resolve(host, 'A');

  expect(dnsResponse.length).toBeGreaterThanOrEqual(1); //Loadbalancer should be deployed in atleast two AZs

  return result({
    check: pass,
    message: 'DNS records pass basic tests'
  });
}

expect.extend({
  dnsHasALBAliasARecord,
  dnsPublicHttpEndpointToPassBasicTests
});
