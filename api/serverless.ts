import type { AWS } from "@serverless/typescript";

import handleMessage from "@functions/handleMessage";

const serverlessConfiguration: AWS = {
	service: "aws-nodejs-typescript",
	frameworkVersion: "3",
	plugins: ["serverless-esbuild", "serverless-offline"],
	provider: {
		name: "aws",
		runtime: "nodejs16.x",
		apiGateway: {
			minimumCompressionSize: 1024,
			shouldStartNameWithService: true,
		},
		environment: {
			AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
			NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
		},
	},
	// import the function via paths
	functions: { handleMessage },
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
	},
};

module.exports = serverlessConfiguration;
