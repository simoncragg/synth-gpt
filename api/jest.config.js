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
		"^@functions/(.*)": "<rootDir>/src/functions/$1",
		"^@libs/(.*)": "<rootDir>/src/libs/$1",
	},
	collectCoverageFrom: ["src/**/*.ts"],
};
