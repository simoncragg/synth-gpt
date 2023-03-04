import { main } from "@functions/handleMessage/handler";
import { buildHttpPostEvent, buildContext } from "./builders";


const handleMessage = "handleMessage";

describe("handleMessage handler", () => {

	const body = { message: "this is a test" };
	const event = buildHttpPostEvent(`/${handleMessage}`, body);
	const context = buildContext(handleMessage);

	it("handleMessage parrots the incoming message", async () => {
		const result = await main(event, context);
		expect(result).toHaveProperty("statusCode", 200);
		expect(JSON.parse(result.body).message).toEqual(`${body.message}.`);
	});
});
