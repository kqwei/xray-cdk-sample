import { Duration, NestedStack, NestedStackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { Code, LayerVersion, Runtime, Tracing } from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Queue } from 'aws-cdk-lib/aws-sqs'
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources'
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb'
import { IdentitySource, LambdaIntegration, RestApi, TokenAuthorizer } from 'aws-cdk-lib/aws-apigateway'

export class SampleServiceStack extends NestedStack {
  constructor(
    scope: Construct,
    id: string,
    props: NestedStackProps | undefined,
  ) {
    super(scope, id, props)

    /**
     * SQS
     */
    const sqs = new Queue(this, 'Queue', {
      fifo: true,
      queueName: `sample-sqs.fifo`,
      visibilityTimeout: Duration.seconds(300),
      deliveryDelay: Duration.seconds(3),
      receiveMessageWaitTime: Duration.seconds(20),
    })

    /**
     * DynamoDB
     */
    const sampleTable = new Table(this, 'sample-table', {
      tableName: 'sample-table',
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
    })

    /**
     * Lambda Layer
     */
    const commonLayer = new LayerVersion(this, 'common-layer', {
      compatibleRuntimes: [Runtime.NODEJS_20_X],
      code: Code.fromAsset('./lambda/layers/common-layer'),
    })

    /**
     * Producer Lambda Function
     */
    const sampleProducerLambda = new NodejsFunction(this, 'sample-producer', {
      functionName: 'sample-producer',
      entry: './lambda/functions/sample-producer/index.ts',
      handler: 'handler',
      runtime: Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: Duration.seconds(15),
      layers: [commonLayer],
      environment: {
        SQS_URL: sqs.queueUrl,
      },
      tracing: Tracing.ACTIVE,
    })
    const sampleProducerLambdaIntergration = new LambdaIntegration(sampleProducerLambda)
    sampleTable.grantReadWriteData(sampleProducerLambda)
    sqs.grantSendMessages(sampleProducerLambda)

    /**
    * Consumer Lambda Function
    */
    const sampleConsumerLambda = new NodejsFunction(this, 'sample-consumer', {
      functionName: 'sample-consumer',
      entry: './lambda/functions/sample-consumer/index.ts',
      handler: 'handler',
      runtime: Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: Duration.seconds(15),
      layers: [commonLayer],
      tracing: Tracing.ACTIVE,
    })
    sampleTable.grantReadWriteData(sampleConsumerLambda)
    sampleConsumerLambda.addEventSource(new SqsEventSource(sqs, {
      batchSize: 1,
      maxConcurrency: 2,
    }))

    /**
    * Authorizer Lambda Function
    */

    const sampleAuthorizerLambda = new NodejsFunction(this, 'sample-authorizer', {
      functionName: 'sample-authorizer',
      entry: './lambda/functions/sample-authorizer/index.ts',
      handler: 'handler',
      runtime: Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: Duration.seconds(15),
      layers: [commonLayer],
      tracing: Tracing.ACTIVE,
    })

    /**
    * ApiGateway
    */
    const sampleApi = new RestApi(this, 'sample-api', {
      restApiName: `sample-api`,
      deployOptions: {
        stageName: 'v1',
        tracingEnabled: true,
      },
    })
    const sampleApiAuthorizer = new TokenAuthorizer(this, 'sample-api-authorizer', {
      authorizerName: 'sampleAuthorizer',
      handler: sampleAuthorizerLambda, // ここでLambda Authorizer用のLambda関数を割り当てる
      identitySource: IdentitySource.header('Authorization'), // アクセストークンを渡すためのヘッダーを指定
    })
    const samplesResource = sampleApi.root.addResource('samples')
    samplesResource.addMethod('GET', sampleProducerLambdaIntergration, {
      authorizer: sampleApiAuthorizer,
    })
  }
}
