import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { formatJSONResponse } from "@libs/api-gateway";
import { generateAudioStreamAsync } from "../../proxies/elevenLabsApiProxy";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import schema from "./schema";

const s3CredsForDev = { accessKeyId: "S3RVER", secretAccessKey: "S3RVER" };
const s3Config = process.env.STAGE == "dev"
	? {
		forcePathStyle: true,
		credentials: s3CredsForDev,
		endpoint: "http://localhost:4569",
	}
	: { forcePathStyle: true };

const textToSpeech: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
	const { transcript } = event.body;

	try {

		console.time("textToSpeech");

		console.time("generateAudioStreamAsync");
		const audioStream = await generateAudioStreamAsync(transcript);
		console.timeEnd("generateAudioStreamAsync");

		const s3 = new S3Client(s3Config);
		const filename = `${Date.now()}.mpg`;

		await s3.send(
			new PutObjectCommand({
				Bucket: process.env.S3_AUDIO_BUCKET_NAME,
				Key: filename,
				Body: audioStream,
			})
		);

		const audioUrl = await getSignedUrl(s3,
			new GetObjectCommand({
				Bucket: process.env.S3_AUDIO_BUCKET_NAME,
				Key: filename
			}), { expiresIn: 60 }
		);

		console.timeEnd("textToSpeech");

		return formatJSONResponse<TextToSpeechResponseBody>({
			transcript,
			audioUrl
		});

	} catch (error) {
		console.log(error, { level: "error" });
		return formatJSONResponse<ErrorResponseBody>({
			error: "An error occurred while generating the audio file"
		}, 500);
	}
};

export const main = middyfy(textToSpeech);
