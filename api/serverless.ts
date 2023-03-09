import type { AWS } from "@serverless/typescript";
import handleMessage from "@functions/handleMessage";
import textToSpeech from "@functions/textToSpeech";

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
		environment: {
			AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
			NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
			STAGE: "${opt:stage, 'dev'}",
			REGION: "${self:provider.region}",
			OPENAI_API_BASE_URL: "https://api.openai.com/v1",
			OPENAI_API_KEY: process.env.OPENAI_API_KEY,
			POLLY_ACCESS_KEY_ID: process.env.POLLY_ACCESS_KEY_ID,
			POLLY_SECRET_ACCESS_KEY: process.env.POLLY_SECRET_ACCESS_KEY,
			S3_AUDIO_BUCKET_NAME: "synth-gpt-audio-${opt:stage, 'dev'}",
		},
	},
	package: { individually: true },
	custom: {
		"serverless-offline": {
			httpPort: 3001
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
				"Action": [
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
			start: {
				image: "dynamodb-local",
				port: 8000,
				inMemory: true,
				heapInitial: "200m",
				heapMax: "1g",
				seed: false,
				convertEmptyValues: true,
				noStart: true,
				migrate: true,
			},
		},
		s3: {
			host: "localhost",
			directory: `${__dirname}/s3`
		},
	},
	functions: {
		handleMessage,
		textToSpeech
	},
	resources: {
		Resources: {
			chatsTable: {
				Type: "AWS::DynamoDB::Table",
				Properties: {
					TableName: "chats-${opt:stage, 'dev'}",
					AttributeDefinitions: [
						{
							AttributeName: "id",
							AttributeType: "S"
						},
					],
					KeySchema: [
						{
							AttributeName: "id",
							KeyType: "HASH"
						},
					],
					ProvisionedThroughput: {
						ReadCapacityUnits: 1,
						WriteCapacityUnits: 1,
					},
					BillingMode: "PAY_PER_REQUEST",
					StreamSpecification: {
						StreamViewType: "NEW_AND_OLD_IMAGES"
					},
				}
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
