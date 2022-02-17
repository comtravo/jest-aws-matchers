import * as AWS from 'aws-sdk';
import { awsConfig } from './aws_retry_config';
import { AWS_ACCOUNT_ID, AWS_REGION } from './helpers';

export const ecsClient = new AWS.ECS(awsConfig);

export async function describeEcsService(ecsClusterName: string, ecsService: string) {
  const response = await ecsClient
    .describeServices({
      cluster: ecsClusterName,
      services: [ecsService]
    })
    .promise();

  expect(response.services![0]).toBeTruthy();

  return response.services![0];
}

export async function describeEcsTaskDefinition(taskDefinitionArn: string) {
  const response = await ecsClient
    .describeTaskDefinition({
      taskDefinition: taskDefinitionArn
    })
    .promise();

  expect(response.taskDefinition).toBeTruthy();

  return response.taskDefinition!;
}

export async function basicECSLoadBalancerServiceTests(
  ecsClusterName: string,
  ecsService: string,
  containerPort: number
) {
  const service = await describeEcsService(ecsClusterName, ecsService);

  expect(service.serviceName).toEqual(ecsService);
  expect(service.status).toEqual('ACTIVE');
  expect(service.desiredCount).toBeGreaterThanOrEqual(1);
  // expect(service.roleArn).toMatch(
  //   `arn:aws:iam::${AWS_ACCOUNT_ID}:role/${CT_ENVIRONMENT}/${ecsService}-alb-role-${CT_ENVIRONMENT}`
  // );

  const loadBalancer = service.loadBalancers![0];

  expect(loadBalancer.containerName).toEqual(ecsService);
  expect(loadBalancer.containerPort).toEqual(containerPort);
  // expect(loadBalancer.targetGroupArn).toMatch(
  //   `arn:aws:elasticloadbalancing:${AWS_REGION}:${AWS_ACCOUNT_ID}:targetgroup/${ecsService}-${CT_ENVIRONMENT}/`
  // );

  return service;
}

export async function basicECSLoadBalancerTaskDefinitionTests(
  ecsClusterName: string,
  ecsService: string,
  containerPort: number
) {
  const ecsServiceResponse = await describeEcsService(ecsClusterName, ecsService);

  const ecsTaskDefinitionResponse = await describeEcsTaskDefinition(ecsServiceResponse.taskDefinition!);

  const containerDefinition = ecsTaskDefinitionResponse.containerDefinitions![0];

  expect(ecsTaskDefinitionResponse.status).toEqual('ACTIVE');
  expect(containerDefinition.name).toEqual(ecsService);
  expect(containerDefinition.essential).toEqual(true);
  expect(containerDefinition.portMappings).toContainEqual({
    containerPort: containerPort,
    hostPort: 0,
    protocol: 'tcp'
  });

  return ecsTaskDefinitionResponse;
}

export async function fetchECSServiceSecrets(ecsClusterName: string, ecsService: string) {
  const ecsServiceResponse = await describeEcsService(ecsClusterName, ecsService);

  const ecsTaskDefinitionResponse = await describeEcsTaskDefinition(ecsServiceResponse.taskDefinition!);

  return ecsTaskDefinitionResponse.containerDefinitions?.[0].secrets;
}

export async function fetchECSServiceEnvironmentVariables(ecsClusterName: string, ecsService: string) {
  const ecsServiceResponse = await describeEcsService(ecsClusterName, ecsService);

  const ecsTaskDefinitionResponse = await describeEcsTaskDefinition(ecsServiceResponse.taskDefinition!);

  return ecsTaskDefinitionResponse.containerDefinitions?.[0].environment;
}
