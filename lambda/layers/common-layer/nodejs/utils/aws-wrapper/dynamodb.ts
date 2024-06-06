import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, GetCommandInput, PutCommand, PutCommandInput, QueryCommand, QueryCommandInput } from '@aws-sdk/lib-dynamodb'
import { captureAWSv3Client } from 'aws-xray-sdk'

class DynamoDBWrapperError extends Error { }

/**
 * DynamoDBラッパークラス
 */
export class DynamoDBWrapper {
  private _tableName: string
  private _docClient: DynamoDBDocumentClient
  constructor(tableName: string) {
    const client = captureAWSv3Client(new DynamoDBClient({
      region: 'ap-northeast-1',
    }))
    this._docClient = DynamoDBDocumentClient.from(client)
    this._tableName = tableName
  }

  async query(params: Readonly<Omit<QueryCommandInput, 'TableName'>>) {
    const commandInput = new QueryCommand({
      ...params,
      TableName: this._tableName,
    })
    const items = await this._docClient
      .send((commandInput))
      .catch((e) => {
        console.log(e)
        throw new DynamoDBWrapperError('DynamoDB Query Error')
      })
      .then(response => response.Items)

    return items ?? []
  }

  async getItem(key: NonNullable<Readonly<GetCommandInput['Key']>>) {
    const commandInput = new GetCommand({
      Key: {
        ...key,
      },
      TableName: this._tableName,
      ConsistentRead: false,
    })
    const item = await this._docClient
      .send(commandInput)
      .catch((e) => {
        console.log(e)
        throw new DynamoDBWrapperError('DynamoDB GetItem Error')
      })
      .then(response => response.Item)

    return item ?? null
  }

  async putItem(item: NonNullable<Readonly<PutCommandInput['Item']>>) {
    const commandInput = new PutCommand({
      Item: item,
      TableName: this._tableName,
    })
    await this._docClient.send(commandInput) // DynamoDBにputする処理
  }
}
