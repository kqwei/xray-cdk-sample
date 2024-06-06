import axios from 'axios'
import { SQSWrapper } from 'utils/aws-wrapper/sqs'
import { lambdaWrapper } from 'utils/lambda-wrapper'

const SQS_URL = process.env.SQS_URL as string

/**
 * ハンドラー関数
 */
export const handler = lambdaWrapper(async () => {
  const hoge = await axios(`https://httpstat.us/200?sleep=1000`, {
    method: 'GET',
  }).then(res => res.data) // 外部API呼ぶ処理
  const fuga = await axios(`https://httpstat.us/200?sleep=3000`, {
    method: 'GET',
  }).then(res => res.data) // 外部API呼ぶ処理
  const piyo = await axios(`https://httpstat.us/200?sleep=3000`, {
    method: 'GET',
  }).then(res => res.data) // 外部API呼ぶ処理

  console.log('test-start')
  const sqs = new SQSWrapper(SQS_URL)
  await sqs.sendMessage({
    MessageBody: 'test',
  })
  console.log('test-end')

  return {
    hoge,
    fuga,
    piyo,
  }
})
