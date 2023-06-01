import middy from "@middy/core";
import middyJsonBodyParser from "@middy/http-json-body-parser";
import authCheck from "./authCheck";

export const middyfy = (handler) => {
	return middy(handler)
		.use(authCheck())
		.use(middyJsonBodyParser());
};
