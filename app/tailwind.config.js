module.exports = {
	darkMode: "class",
	content: [
		"./src/**/*.{js,jsx,ts,tsx}",
		"node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}",
	],
	theme: {
		extend: {
			animation: {
				loader: "loader 0.6s infinite alternate",
			},
			keyframes: {
				loader: {
					to: {
						opacity: 0.1,
						transform: "translate3d(0, -0.5rem, 0)",
					},
				},
			},
		},
	},
	plugins: [require("flowbite/plugin")],
};
