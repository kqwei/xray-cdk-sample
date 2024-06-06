import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { SampleServiceStack } from './service-stacks/sample-service'

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'ApiQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });

    new SampleServiceStack(this, 'sample-service-stack', props)
  }
}
