import type { AWS } from "@serverless/typescript";
import connect from "@websocket/connect";
import deleteChat from "@http/deleteChat";
import disconnect from "@websocket/disconnect";
import generateTitle from "@http/generateTitle";
import getChat from "@http/getChat";
import getChats from "@http/getChats";
import handleUserMessage from "@websocket/handleUserMessage";
import patchChat from "@http/patchChat";
import processUserMessage from "@invoke/processUserMessage";

const serverlessConfiguration: AWS = {
	service: "aws-nodejs-typescript",
	frameworkVersion: "3",
	plugins: [
		"serverless-esbuild",
		"serverless-offline",
		"serverless-s3-local",
		"serverless-dynamodb-local",
	],
	provider: {
		name: "aws",
		runtime: "nodejs16.x",
		region: "eu-west-1",
		timeout: 29,
		apiGateway: {
			minimumCompressionSize: 1024,
			shouldStartNameWithService: true,
		},
		websocketsApiRouteSelectionExpression: "$request.body.type",
		environment: {
			AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
			NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
			AWS_ACCOUNT_ID: "000000000000",
			REGION: "${self:provider.region}",
			STAGE: "${opt:stage, 'dev'}",
			OPENAI_API_BASE_URL: "https://api.openai.com/v1",
			OPENAI_API_KEY: process.env.OPENAI_API_KEY,
			POLLY_ACCESS_KEY_ID: process.env.POLLY_ACCESS_KEY_ID,
			POLLY_SECRET_ACCESS_KEY: process.env.POLLY_SECRET_ACCESS_KEY,
			S3_AUDIO_BUCKET_NAME: "synth-gpt-audio-${opt:stage, 'dev'}",
			BING_SEARCH_API_ENDPOINT: "https://api.bing.microsoft.com/v7.0/search",
			BING_SEARCH_API_KEY: process.env.BING_SEARCH_API_KEY,
		},
	},
	package: { individually: true },
	custom: {
		"serverless-offline": {
			httpPort: 3001,
			lambdaPort: 3002,
			websocketPort: 4001,
			host: "localhost",
		},
		esbuild: {
			bundle: true,
			minify: false,
			sourcemap: true,
			exclude: ["aws-sdk"],
			target: "node16",
			define: { "require.resolve": undefined },
			platform: "node",
			concurrency: 10,
		},
		iamRoleStatements: [
			{
				Effect: "Allow",
				Action: [
					"lambda:InvokeFunction",
				],
				Resource: "arn:aws:lambda:::processUserMessage-${opt:stage, 'dev'}",
			},
			{
				Effect: "Allow",
				Action: [
					"dynamodb:DescribeTable",
					"dynamodb:Query",
					"dynamodb:Scan",
					"dynamodb:GetItem",
					"dynamodb:BatchGetItem"
				],
				Resource: "arn:aws:dynamodb:::chats-${opt:stage, 'dev'}",
			},
			{
				Effect: "Allow",
				Action: [
					"s3:GetObject",
					"s3:PutObject",
				],
				Resource: "arn:aws:s3:::synth-gpt-audio-${opt:stage, 'dev'}/*",
			},
		],
		dynamodb: {
			stages: [
				"dev",
			],
			seed: {
				domain: {
					sources: {
						table: "chats-${opt:stage, 'dev'}",
						sources: ["./seed/chats.json"]
					}
				}
			},
			start: {
				image: "dynamodb-local",
				port: 8000,
				inMemory: true,
				heapInitial: "200m",
				heapMax: "1g",
				seed: true,
				convertEmptyValues: true,
				noStart: true,
				migrate: true,
			},
		},
		s3: {
			address: "localhost",
			post: 4569,
			directory: `${__dirname}/s3`,
		},
	},
	functions: {
		// http
		deleteChat,
		generateTitle,
		getChat,
		getChats,
		patchChat,
		// websocket
		connect,
		handleUserMessage,
		disconnect,
		// invoke
		processUserMessage,
	},
	resources: {
		Resources: {
			chatsTable: {
				Type: "AWS::DynamoDB::Table",
				Properties: {
					TableName: "chats-${opt:stage, 'dev'}",
					AttributeDefinitions: [
						{ AttributeName: "chatId", AttributeType: "S" },
						{ AttributeName: "userId", AttributeType: "S" },
					],
					KeySchema: [
						{ AttributeName: "chatId", KeyType: "HASH" },
					],
					ProvisionedThroughput: {
						ReadCapacityUnits: 1,
						WriteCapacityUnits: 1,
					},
					GlobalSecondaryIndexes: [
						{
							IndexName: "userId-index",
							KeySchema: [
								{ AttributeName: "userId", KeyType: "HASH" },
							],
							Projection: { ProjectionType: "ALL" },
							ProvisionedThroughput: {
								ReadCapacityUnits: 1,
								WriteCapacityUnits: 1,
							},
						},
					],
					BillingMode: "PAY_PER_REQUEST",
					StreamSpecification: {
						StreamViewType: "NEW_AND_OLD_IMAGES"
					},
				},
			},
			audioBucket: {
				Type: "AWS::S3::Bucket",
				Properties: {
					BucketName: "synth-gpt-audio-${opt:stage, 'dev'}",
					LifecycleConfiguration: {
						Rules: [
							{
								Id: "DeleteOldObjects",
								Status: "Enabled",
								ExpirationInDays: 0.02
							}
						]
					}
				},
			},
		},
	},
};

module.exports = serverlessConfiguration;
