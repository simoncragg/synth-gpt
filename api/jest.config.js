/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
	setupFiles: ["<rootDir>/setEnvVars.js"],
	preset: "ts-jest",
	testEnvironment: "node",
	testMatch: ["<rootDir>/tests/**/*.test.ts"],
	modulePathIgnorePatterns: [
		"<rootDir>/(node_modules|dist|.serverless|.build)/",
	],
	moduleNameMapper: {
		"^@http/(.*)": "<rootDir>/src/http/$1",
		"^@invoke/(.*)": "<rootDir>/src/invoke/$1",
		"^@libs/(.*)": "<rootDir>/src/libs/$1",
		"^@proxies/(.*)": "<rootDir>/src/proxies/$1",
		"^@repositories/(.*)": "<rootDir>/src/repositories/$1",
	},
	collectCoverageFrom: ["src/**/*.ts"],
};
