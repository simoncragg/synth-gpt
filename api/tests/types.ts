import type { APIGatewayProxyEvent } from "aws-lambda";

export type ValidatedAPIGatewayProxyEvent<T> = Omit<APIGatewayProxyEvent, "body"> & { body: T }
