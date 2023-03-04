import { mocked } from "jest-mock";
import { generateAudioStreamAsync } from "../../src/proxies/elevenLabsApiProxy";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client } from "@aws-sdk/client-s3";
import { buildHttpPostEvent, buildContext } from "./builders";
import { formatJSONResponse } from "@libs/api-gateway";
import { main } from "../../src/functions/textToSpeech/handler";

jest.mock("../../src/proxies/elevenLabsApiProxy");
jest.mock("@aws-sdk/client-s3");
jest.mock("@aws-sdk/s3-request-presigner");

const generateAudioStreamAsyncMock = mocked(generateAudioStreamAsync);
const s3ClientMock = mocked(S3Client);
const getSignedUrlMock = mocked(getSignedUrl);

describe("textToSpeech", () => {
	const transcript = "this is a test";
	const audioStream = Buffer.from("audio stream");
	const signedUrl = "https://mock-audio-url.com";
	const errorMessage = "An error occurred while generating the audio file";

	const textToSpeech = "textToSpeech";
	const body = { transcript: "this is a test" };
	const event = buildHttpPostEvent(`/${textToSpeech}`, body);
	const context = buildContext(textToSpeech);

	beforeEach(() => {
		generateAudioStreamAsyncMock.mockClear();
		s3ClientMock.mockClear();
		getSignedUrlMock.mockClear();
	});

	it("should return transcript and audioUrl", async () => {
		generateAudioStreamAsyncMock.mockResolvedValue(audioStream);
		s3ClientMock.prototype.send.mockReturnValue(undefined as never);
		getSignedUrlMock.mockResolvedValue(signedUrl);

		const textToSpeech = "textToSpeech";
		const body = { transcript };
		const event = buildHttpPostEvent(`/${textToSpeech}`, body);
		const context = buildContext(textToSpeech);

		const result = await main(event, context);

		expect(result).toEqual(formatJSONResponse({
			transcript: transcript,
			audioUrl: signedUrl
		}));
	});

	it("should return error response on failure to generate audio stream", async () => {
		generateAudioStreamAsyncMock.mockResolvedValue(audioStream);
		generateAudioStreamAsyncMock.mockRejectedValue(
			new Error("Failed to generate audio stream")
		);

		const result = await main(event, context);

		expect(result).toEqual(formatJSONResponse({
			error: errorMessage,
		}, 500));
	});

	it("should return error response on failure to upload audio stream to S3 bucket", async () => {

		generateAudioStreamAsyncMock.mockResolvedValue(audioStream);
		s3ClientMock.prototype.send.mockRejectedValue(new Error("Failed to upload object to bucket") as never);

		const result = await main(event, context);

		expect(result).toEqual(formatJSONResponse({
			error: errorMessage,
		}, 500));
	});

	it("should return error response on failure to get signed URL", async () => {

		generateAudioStreamAsyncMock.mockResolvedValue(audioStream);
		s3ClientMock.prototype.send.mockResolvedValue(undefined as never);
		getSignedUrlMock.mockRejectedValue(new Error("Failed to get signed URL") as never);

		const result = await main(event, context);

		expect(result).toEqual(formatJSONResponse({
			error: errorMessage,
		}, 500));
	});
});
