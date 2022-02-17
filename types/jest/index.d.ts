declare namespace NodeJS {
  interface Global {}
}

declare namespace jest {
  interface Matchers<R> {
    arrayOfObjectsToHavePartialObject<I>(expected: I): R;
    apiGatewayToPassBasicTests(): R;
    apiGatewayToHaveResources<I>(expected: I): R;
    cloudWatchEventsRuleToExistWithScheduleExpression<I>(expected: I): R;
    cloudWatchEventsRuleToTriggerTarget<I>(expected: I): R;
    cloudWatchEventsRuleToTriggerTargetWithInputJson<I>(expected: I): R;
    cloudwatchLogGroupToHaveSubscriptionToLambda<I>(expected: I): R;
    dnsHasALBAliasARecord(): R;
    dnsPublicHttpEndpointToPassBasicTests(): R;
    ecsServiceShouldPassHealthChecks(): R;
    firehoseToPassBasicTests(): R;
    firehoseToHaveAssumeRolePolicy(): R;
    firehoseToHaveIAMPolicy(): R;
    iamRoleToHaveBasicPermissionsForLambdaExecution(): R;
    lambdaToPassBasicTests(): R;
    lambdaTohaveConfiguration<I>(expected: I): R;
    lambdaToHaveLayers<I>(expected: I): R;
    lambdaToHavePermissionsToBeTriggeredBy<I>(expected: I): R;
    lambdaToHavePermissionsToBeTriggeredByAPIGateway(): R;
    lambdaToHavePermissionsToBeTriggeredByCloudwatchEvents(): R;
    lambdaToHavePermissionsToBeTriggeredByCloudwatchLogs(): R;
    lambdaToHavePermissionsToBeTriggeredByStepFunction(): R;
    lambdaToBeTriggeredBySNSTopics<I>(expected: I): R;
    lambdaToHaveEventSourceMapping<I>(expected: I): R;
    r53ToHavePublicAliasRecord(): R;
    snsToPassBasicSNSTests(): R;
    snsToHaveSubscriptionWithSqs<I>(expected: I): R;
    stepFunctionToPassBasicTests(): R;
    stepFunctionShouldHaveResources<I>(expected: I): R;
    s3ToPassBasicTests(): R;
    s3ToHaveNoPublicAcl(): R;
    s3ToBeEncrypted(): R;
    s3ToHaveCorrectObjectOwnership(): R;
    sqsToPassBasicTests(): R;
    sqsFifoToPassBasicTests(): R;
    sqsToBeTriggeredBySNSTopics<I>(expected: I): R;
    sqsToBeFifo(): R;
    toMatchArrayPartially<I>(expected: I): R;
    toMatchArray<I>(expected: I): R;
  }
}
