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
		"^@clients/(.*)": "<rootDir>/src/clients/$1",
		"^@handlers/(.*)": "<rootDir>/src/handlers/$1",
		"^@libs/(.*)": "<rootDir>/src/libs/$1",
		"^@repositories/(.*)": "<rootDir>/src/repositories/$1",
		"^@services/(.*)": ["<rootDir>/src/services/$1"],
		"^@websocket/(.*)": "<rootDir>/src/handlers/websocket/$1",
	},
	collectCoverageFrom: ["src/**/*.ts"],
};
