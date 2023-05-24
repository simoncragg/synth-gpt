module.exports = {
	testEnvironment: "jsdom",
	transform: {
		"\\.(js|ts|jsx|tsx)$": "babel-jest",
	},
	moduleNameMapper: {
		"\\.(css)$": "identity-obj-proxy",
	},
};
