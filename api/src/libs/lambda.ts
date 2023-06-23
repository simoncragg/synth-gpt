import middy from "@middy/core";
import middyJsonBodyParser from "@middy/http-json-body-parser";

import type { Handler } from "aws-lambda";
import authCheck from "./authCheck";

export const middyfy = (handler: Handler) => {
	return middy(handler)
		.use(authCheck())
		.use(middyJsonBodyParser());
};
