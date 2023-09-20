import { mocked } from "jest-mock";
import { performTextToSpeech } from "@clients/pollyApiClient";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client } from "@aws-sdk/client-s3";
import TextToSpeechService from "@services/TextToSpeechService";

jest.mock("@aws-sdk/client-s3");
jest.mock("@aws-sdk/s3-request-presigner");
jest.mock("@clients/pollyApiClient");

const performTextToSpeechMock = mocked(performTextToSpeech);
const s3ClientMock = mocked(S3Client);
const getSignedUrlMock = mocked(getSignedUrl);

describe("TextToSpeechService", () => {
	const transcript = "this is a test";
	const signedUrl = "https://mock-audio-url.local/";

	beforeEach(() => {
		performTextToSpeechMock.mockClear();
		s3ClientMock.mockClear();
		getSignedUrlMock.mockClear();
	});

	it("should generate an audioUrl for a given transcript", async () => {
		getSignedUrlMock.mockResolvedValue(signedUrl);

		const textToSpeechService = new TextToSpeechService();
		const result = await textToSpeechService.generateSignedAudioUrlAsync(transcript);

		expect(result).toEqual(new URL(signedUrl));
	});
});
