import { PASS as pass, result } from './result';

import { APIGateway } from 'aws-sdk';
import { apiGatewayClient } from '../lib/api_gateway';

function findApiMetadata(apiGatewayName: string, getRestApisResponse: APIGateway.RestApis) {
  return getRestApisResponse.items?.find((item) => {
    return item.name === apiGatewayName;
  });
}

async function getAPIGatewayMetadata(
  apiGatewayName: string,
  position?: string
): Promise<APIGateway.RestApi | undefined> {
  const params: APIGateway.RestApis = {};

  if (position) {
    params.position = position;
  }

  const getRestApisResponse = await apiGatewayClient.getRestApis(params).promise();

  const apiMetadata = findApiMetadata(apiGatewayName, getRestApisResponse);

  if (getRestApisResponse.position && !apiMetadata) {
    return getAPIGatewayMetadata(apiGatewayName, getRestApisResponse.position);
  }

  return apiMetadata;
}

async function getApiSpec(apiGatewayName: string, stageName: string) {
  const apiGatewayMetadata = await getAPIGatewayMetadata(apiGatewayName);

  const getExportRequest = {
    restApiId: apiGatewayMetadata!.id,
    stageName: stageName,
    exportType: 'oas30',
    accepts: 'application/json',
    parameters: {
      extensions: 'apigateway'
    }
  } as APIGateway.GetExportRequest;

  const apiGatewayExportResponse = await apiGatewayClient.getExport(getExportRequest).promise();

  if (apiGatewayExportResponse.body instanceof Buffer != true) {
    throw new Error(`apiGatewayExportResponse.body of ${apiGatewayName} is not an instance of Buffer`);
  }

  return apiGatewayExportResponse.body!.toString('utf8');
}

async function apiGatewayToPassBasicTests(apiGatewayName: string, stageName: string, domainName: string) {
  const apiGatewayMetadata = await getAPIGatewayMetadata(apiGatewayName);
  const apiSpec = await getApiSpec(apiGatewayName, stageName);

  const customDomainNameResponse = await apiGatewayClient
    .getBasePathMapping({
      domainName: domainName,
      basePath: `${apiGatewayName}`
    })
    .promise();

  expect(apiGatewayMetadata?.id).toBeDefined();
  expect(customDomainNameResponse.basePath).toMatch(apiGatewayName);
  expect(customDomainNameResponse.stage).toMatch(stageName);
  expect(JSON.parse(apiSpec).info.title).toEqual(apiGatewayName);

  return result({
    check: pass,
    message: 'API Gateway basic tests pass'
  });
}

async function apiGatewayToHaveResources(apiGatewayName: string, stageName: string, arns: string[]) {
  const apiSpec = await getApiSpec(apiGatewayName, stageName);

  arns.forEach((arn) => {
    expect(apiSpec).toContain(arn);
  });

  return result({
    check: pass,
    message: 'ARNs found in API gateway'
  });
}

expect.extend({
  apiGatewayToPassBasicTests,
  apiGatewayToHaveResources
});
