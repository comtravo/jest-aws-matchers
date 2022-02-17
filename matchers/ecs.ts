import * as superagent from 'superagent';
import { PASS as pass, result } from './result';
import { jest } from '@jest/globals';
import wrapSuperagent from 'superagent-retry-delay';

jest.setTimeout(500000);

const request = wrapSuperagent(superagent.default);

async function ecsServiceShouldPassHealthChecks(params: { healthcheckEndpoint: string; expectedResponseCode: number }) {
  const res = await request.get(params.healthcheckEndpoint).retry(50, 2000);
  expect(res.status).toEqual(params.expectedResponseCode);

  return result({
    check: pass,
    message: 'Healthcheck passes'
  });
}

expect.extend({
  ecsServiceShouldPassHealthChecks
});
