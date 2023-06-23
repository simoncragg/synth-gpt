import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import middy from "@middy/core";
import { JwtRsaVerifier } from "aws-jwt-verify";
import { formatJSONResponse } from "@libs/api-gateway";

import type { BaseResponseBody } from "../handlers/http/types";

const verifier = JwtRsaVerifier.create({
	issuer: process.env.JWT_ISSUER_DOMAIN,
	audience: process.env.JWT_AUDIENCE,
	jwksUri: process.env.JWT_JWKS_URI
});

const authCheck = (): middy.MiddlewareObj<APIGatewayProxyEvent, APIGatewayProxyResult> => {

	const before: middy.MiddlewareFn<APIGatewayProxyEvent, APIGatewayProxyResult> = async (
		request
	): Promise<APIGatewayProxyResult> => {
		const authorization = request.event.headers["authorization"];
		const jwt = authorization.replace("Bearer ", "");
		try {
			await verifier.verify(jwt);
		}
		catch {
			return formatJSONResponse<BaseResponseBody>(null, 401);
		}
	};

	return {
		before
	};
};

export default authCheck;