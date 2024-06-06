// 参照：https://github.com/aws/aws-xray-sdk-node/issues/487
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import http from 'http'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import https from 'https'
import { captureHTTPsGlobal, capturePromise } from 'aws-xray-sdk'

export const lambdaWrapper = <T extends (event: unknown) => unknown>(handler: T) => async (event: unknown) => {
  captureHTTPsGlobal(http, false)
  captureHTTPsGlobal(https, false)
  capturePromise()
  return await handler(event)
}
