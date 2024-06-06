import axios from 'axios'
import { DynamoDBWrapper } from 'utils/aws-wrapper/dynamodb'
import { lambdaWrapper } from 'utils/lambda-wrapper'

/**
 * ハンドラー関数
 */
export const handler = lambdaWrapper(async () => {
  const foo = await axios('https://httpstat.us/200?sleep=5000', {
    method: 'GET',
  }).then(res => res.data)

  const dynamodb = new DynamoDBWrapper('sample-table')
  await dynamodb.putItem({
    id: 'test',
    value: foo,
  })
  return {
    foo,
  }
})
