import type { AWS } from "@serverless/typescript";
import handleMessage from "@functions/handleMessage";
import textToSpeech from "@functions/textToSpeech";

const serverlessConfiguration: AWS = {
	service: "aws-nodejs-typescript",
	frameworkVersion: "3",
	plugins: ["serverless-esbuild", "serverless-offline", "serverless-s3-local"],
	provider: {
		name: "aws",
		runtime: "nodejs16.x",
		region: "eu-west-1",
		timeout: 10,
		apiGateway: {
			minimumCompressionSize: 1024,
			shouldStartNameWithService: true,
		},
		environment: {
			AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
			NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
			STAGE: "${opt:stage, 'dev'}",
			OPENAI_API_BASE_URL: "https://api.openai.com/v1",
			OPENAI_API_KEY: process.env.OPENAI_API_KEY,
			ELEVEN_LABS_API_BASE_URL: "https://api.elevenlabs.io/v1",
			ELEVEN_LABS_API_KEY: process.env.ELEVEN_LABS_API_KEY,
			S3_AUDIO_BUCKET_NAME: "synth-gpt-audio",
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
				Action: [
					"s3:GetObject",
					"s3:PutObject",
				],
				Resource: "arn:aws:s3:::synth-gpt-audio/*",
			},
		],
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
			myBucket: {
				Type: "AWS::S3::Bucket",
				Properties: {
					BucketName: "synth-gpt-audio",
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
