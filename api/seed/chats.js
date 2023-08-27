module.exports = [
	{
		chatId: "a8fe96dd-39df-400a-841c-860e14808c59",
		title: "User requests assistance.",
		userId: process.env.TEST_USER_ID,
		model: "gpt-4",
		messages: [
			{
				id: "56921588-d729-46d2-b028-5117f7fa1610",
				role: "user",
				attachments: [],
				content: {
					type: "text",
					value: "Hi Synth. How are you?",
				},
				timestamp: 1680027839000,
			},
			{
				id: "89647995-54b9-498e-a676-b6686ef30908",
				role: "assistant",
				attachments: [],
				content: {
					type: "text",
					value: "Hello! I'm an AI language model, so I don't have feelings in the way humans do. But I'm always ready to assist you with anything language-related! How can I help today?",
				},
				timestamp: 1680027839000,
			},
		],
		createdTime: 1680027823025,
		updatedTime: 1680027883025,
	},
	{
		chatId: "53729415-fae2-40cd-833e-792fd9aa108f",
		title: "Prime or composite?",
		userId: process.env.TEST_USER_ID,
		model: "gpt-3.5-turbo",
		messages: [
			{
				id: "0b88030c-1fd2-466a-bfee-1a1a0a591970",
				role: "user",
				attachments: [],
				content: {
					type: "text",
					value: "Is number one prime or composite?",
				},
				timestamp: 1680123790000,
			},
			{
				id: "8089dce3-75d5-4f9a-ad84-8663603bc741",
				role: "assistant",
				attachments: [],
				content: {
					type: "text",
					value: "Number one is neither prime nor composite.",
				},
				timestamp: 1680123850000,
			},
		],
		createdTime: 1680123729317,
		updatedTime: 1680123850000,
	},
];
