import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda'
import { lambdaWrapper } from 'utils/lambda-wrapper'

const generateAuthorizerResult = (effect: string, resource: string): APIGatewayAuthorizerResult => {
  const result: APIGatewayAuthorizerResult = {
    principalId: 'Authorizer',
    policyDocument: {
      Version: '2012-10-17',
      Statement: [{
        Action: 'execute-api:Invoke',
        Effect: effect,
        Resource: resource,
      }],
    },
  }

  return result
}

/**
 * ハンドラー関数
 */
export const handler = lambdaWrapper(async (event: APIGatewayTokenAuthorizerEvent) => {
  const param = event?.authorizationToken ?? ''
  console.log(`param is ${param}`)

  if (param === 'allow') {
    return generateAuthorizerResult('Allow', event.methodArn)
  }
  else if (param === 'deny') {
    return generateAuthorizerResult('Deny', event.methodArn)
  }
  else {
    throw new Error('Unauthorized')
  }
})
