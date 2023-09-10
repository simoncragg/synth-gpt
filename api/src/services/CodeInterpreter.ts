import { Lambda } from "aws-sdk";

import type {
	CodeExecutionResponse,
	ExecutionResultString
} from "../types";

import { isDev } from "../constants";

class CodeInterpreter {

	async executeCode(code: string): Promise<CodeExecutionResponse> {
		const lambda = this.createLambda();
		const response = await lambda.invoke({
			FunctionName: process.env.CODE_INTERPRETER_FUNCTION_NAME,
			InvocationType: "Event",
			Payload: JSON.stringify({code}),
		}).promise();

		if (response.StatusCode == 200) {
			const json = response.Payload.toString();
			const data = JSON.parse(json.trim());

			console.log("*******************************************************************");
			console.log("* CodeInterpreter -> executeCode								  *");
			console.log("*																 *");
			console.log("*******************************************************************");
			console.log("");

			console.log({data});
			console.log("-------------------------------------------------------------------");
			console.log("");

			if (data["errorMessage"]) {
				return {
					success: false,
					error: {
						errorMessage: data["errorMessage"],
						errorType: data["errorType"],
						stackTrace: data["stackTrace"],
					}
				};
			}

			return {
				success: true,
				result: {
					type: "string",
					value: data["value"],
				} as ExecutionResultString,
			};
		}
		else {
			throw new Error(
				`Code Interpreter invocation error: ${response.FunctionError}`
			);
		}
	}

	private createLambda() {
		return isDev ?
			new Lambda({
				endpoint: "http://localhost:9000",
				credentials: {
					accessKeyId: "local",
					secretAccessKey: "local",
				},
			})
			: new Lambda();
	}
}

export default CodeInterpreter;
