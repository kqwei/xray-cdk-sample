// 参照：https://github.com/aws/aws-xray-sdk-node/issues/487
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import http from 'http'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import https from 'https'
import { captureHTTPsGlobal, capturePromise } from 'aws-xray-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

const initXray = () => {
  captureHTTPsGlobal(http, false)
  captureHTTPsGlobal(https, false)
  capturePromise()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const lambdaWrapper = <T extends (args: any) => any>(handler: T) => async (args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
  initXray()
  return await handler(args)
}

export const apiGatewayIntergratedlambdaWrapper = <T extends (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>>(handler: T) => async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  initXray()
  return await handler(event)
}
