import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import schema from "./schema";

const handleMessage: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
	return formatJSONResponse<HandleMessageResponseBody>({
		message: `${event.body.message}.`
	});
};

export const main = middyfy(handleMessage);
