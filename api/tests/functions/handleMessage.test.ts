import { mocked } from "jest-mock";
import { buildHttpPostEvent, buildContext } from "./builders";
import { generateChatResponseAsync } from "../../src/proxies/openaiApiProxy";
import { formatJSONResponse } from "../../src/libs/api-gateway";
import { main } from "@functions/handleMessage/handler";

jest.mock("../../src/proxies/openaiApiProxy");

const generateChatResponseAsyncMock = mocked(generateChatResponseAsync);

describe("handleMessage handler", () => {

	const handleMessage = "handleMessage";
	const body = { message: "hello how are you doing today" };
	const event = buildHttpPostEvent(`/${handleMessage}`, body);
	const context = buildContext(handleMessage);

	it("should return generated chat response message", async () => {

		const chatResponse = {
			role: "assistant" as const,
			content: "\n\nHello there! How may I assist you today?"
		};

		generateChatResponseAsyncMock.mockResolvedValue(chatResponse);

		const result = await main(event, context);

		expect(result).toHaveProperty("statusCode", 200);
		expect(JSON.parse(result.body).message).toEqual(chatResponse.content);
	});

	it("should return error response on failure to generate chat response", async () => {

		const errorMessage = "An unexpected error occurred whilst processing your request";
		generateChatResponseAsyncMock.mockRejectedValue(
			new Error(errorMessage)
		);

		const result = await main(event, context);

		expect(result).toEqual(formatJSONResponse({
			error: errorMessage,
		}, 500));
	});
});
