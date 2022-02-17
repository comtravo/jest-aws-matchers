import { getLambdaFunction, lambdaClient } from '../lib/lambda';
import { IAMPolicy, Principal } from '../lib/interfaces';
import { PASS as pass, result } from './result';

import { AWS_REGION } from '../lib/helpers';
import { generateSQSARN } from '../lib/sqs';
import { Lambda } from 'aws-sdk';

async function lambdaToPassBasicTests(lambdaName: string) {
  const getLambdaFunctionResponse = await getLambdaFunction(lambdaName);

  const expectedTags: Lambda.Tags = {
    Name: lambdaName
    // environment: CT_ENVIRONMENT
  };

  expect(getLambdaFunctionResponse.Configuration?.FunctionName).toEqual(lambdaName);
  expect(getLambdaFunctionResponse.Tags).toMatchObject(expectedTags);
  expect(getLambdaFunctionResponse.Configuration?.State).toEqual('Active');
  expect(getLambdaFunctionResponse.Configuration?.LastUpdateStatus).toEqual('Successful');

  return result({
    check: pass,
    message: 'Lambda basic tests pass'
  });
}

async function lambdaTohaveConfiguration(lambdaName: string, expectedLambdaConfiguration: Lambda.GetFunctionResponse) {
  const getLambdaFunctionResponse = await getLambdaFunction(lambdaName);

  const expectedTags: Lambda.Tags = {
    Name: lambdaName
    // environment: CT_ENVIRONMENT
  };

  expect(getLambdaFunctionResponse.Configuration?.FunctionName).toMatch(lambdaName);
  expect(getLambdaFunctionResponse.Configuration?.State).toEqual('Active');
  expect(getLambdaFunctionResponse.Configuration?.LastUpdateStatus).toEqual('Successful');

  expect(getLambdaFunctionResponse).toMatchObject(expectedLambdaConfiguration);

  expect(getLambdaFunctionResponse.Tags).toMatchObject(expectedTags);

  return result({
    check: pass,
    message: 'Lambda has the expected function configuration'
  });
}

async function lambdaToHavePermissionsToBeTriggeredBy(lambdaArn: string, principal: Principal) {
  const getPolicyResponse = await lambdaClient
    .getPolicy({
      FunctionName: lambdaArn
    })
    .promise();

  const policy: IAMPolicy = JSON.parse(getPolicyResponse.Policy as string);

  const invokeStatement = policy.Statement.find((s) => {
    return (
      s.Effect === 'Allow' &&
      s.Action === 'lambda:InvokeFunction' &&
      s.Resource?.includes(lambdaArn) &&
      (s.Principal?.Service === principal.Service || s.Principal?.AWS === principal.AWS)
    );
  });

  expect(invokeStatement).toBeTruthy();

  return result({
    check: pass,
    message: 'Lambda basic tests pass'
  });
}

async function lambdaToBeTriggeredBySNSTopics(lambdaName: string, snsTopics: string[]) {
  // Every lambda that is triggered by SNS has an internal queue by the same name
  const queueName = lambdaName;
  const queueArn = generateSQSARN(queueName);

  // The internal SQS must pass basic tests
  await expect(queueName).sqsToPassBasicTests();

  // The SQS must be triggered by these SNS topics
  await expect(queueName).sqsToBeTriggeredBySNSTopics(snsTopics);

  // The lambda should be triggered by it's SQS queue
  await expect(lambdaName).lambdaToHaveEventSourceMapping(queueArn);

  return result({
    check: pass,
    message: 'Lambda is triggered by SNS topics'
  });
}

async function lambdaToHaveEventSourceMapping(lambdaName: string, eventSourceArn: string) {
  const res = await lambdaClient
    .listEventSourceMappings({
      FunctionName: lambdaName,
      EventSourceArn: eventSourceArn
    })
    .promise();

  expect(res.EventSourceMappings![0].BatchSize).toEqual(1);
  expect(res.EventSourceMappings![0].State).toEqual('Enabled');

  return result({
    check: pass,
    message: 'Lambda has the eventSourceArn'
  });
}

function lambdaToHavePermissionsToBeTriggeredByAPIGateway(lambdaArn: string) {
  return lambdaToHavePermissionsToBeTriggeredBy(lambdaArn, {
    Service: 'apigateway.amazonaws.com'
  });
}

function lambdaToHavePermissionsToBeTriggeredByCloudwatchEvents(lambdaArn: string) {
  return lambdaToHavePermissionsToBeTriggeredBy(lambdaArn, {
    Service: 'events.amazonaws.com'
  });
}

function lambdaToHavePermissionsToBeTriggeredByStepFunction(lambdaArn: string) {
  return lambdaToHavePermissionsToBeTriggeredBy(lambdaArn, {
    Service: `states.${AWS_REGION}.amazonaws.com`
  });
}

function lambdaToHavePermissionsToBeTriggeredByCloudwatchLogs(lambdaArn: string) {
  return lambdaToHavePermissionsToBeTriggeredBy(lambdaArn, {
    Service: `logs.${AWS_REGION}.amazonaws.com`
  });
}

function lambdaToHaveLayers(actualLayers: Lambda.LayersReferenceList, expectedLayerResourceNames: string[]) {
  expect(expectedLayerResourceNames.length).toBeGreaterThan(0);
  expectedLayerResourceNames.forEach((expectedLayerResourceName) => {
    const lambdaLayerFound = actualLayers.find((actualLayer) => {
      return actualLayer.Arn!.includes(expectedLayerResourceName);
    });

    expect(lambdaLayerFound?.Arn).toMatch(expectedLayerResourceName);
  });

  return result({
    check: pass,
    message: 'All lambda layers found'
  });
}

expect.extend({
  lambdaToPassBasicTests,
  lambdaTohaveConfiguration,
  lambdaToHavePermissionsToBeTriggeredBy,
  lambdaToHavePermissionsToBeTriggeredByAPIGateway,
  lambdaToHavePermissionsToBeTriggeredByCloudwatchEvents,
  lambdaToHavePermissionsToBeTriggeredByCloudwatchLogs,
  lambdaToHavePermissionsToBeTriggeredByStepFunction,
  lambdaToBeTriggeredBySNSTopics,
  lambdaToHaveEventSourceMapping,
  lambdaToHaveLayers
});
