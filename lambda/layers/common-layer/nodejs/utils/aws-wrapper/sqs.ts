import { SQSClient, SendMessageCommand, SendMessageCommandInput } from '@aws-sdk/client-sqs'
import { captureAWSv3Client } from 'aws-xray-sdk'
import { randomUUID } from 'crypto'

export class SQSWrapper {
  sqsUrl: string
  private _client: SQSClient
  constructor(sqsUrl: string) {
    this.sqsUrl = sqsUrl
    this._client = captureAWSv3Client(new SQSClient())
  }

  async sendMessage(message: Omit<SendMessageCommandInput, 'QueueUrl'>) {
    const command = new SendMessageCommand({
      QueueUrl: this.sqsUrl,
      MessageGroupId: message.MessageGroupId ?? randomUUID(),
      MessageDeduplicationId: message.MessageDeduplicationId ?? randomUUID(),
      MessageBody: message.MessageBody,
    })
    await this._client.send(command)
  }
}
