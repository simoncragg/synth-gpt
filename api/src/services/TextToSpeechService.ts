import {
	GetObjectCommand,
	PutObjectCommand,
	S3Client
} from "@aws-sdk/client-s3";
import { isDev } from "../utils";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { performTextToSpeech } from "@clients/pollyApiClient";

export default class TextToSpeechService {
	private readonly s3Client: S3Client;

	constructor() {
		this.s3Client = this.createS3Client();
	}

	async generateSignedAudioUrlAsync(transcript: string): Promise<string> {
		const audioStream = await performTextToSpeech(transcript);
		const filename = `${Date.now()}.mpg`;

		await this.s3Client.send(
			new PutObjectCommand({
				Bucket: process.env.S3_AUDIO_BUCKET_NAME,
				Key: filename,
				Body: audioStream,
			})
		);

		return await getSignedUrl(
			this.s3Client,
			new GetObjectCommand({
				Bucket: process.env.S3_AUDIO_BUCKET_NAME,
				Key: filename
			}), { expiresIn: 60 }
		);
	}

	private createS3Client() {
		const config = isDev
			? {
				forcePathStyle: true,
				credentials: {
					accessKeyId: "S3RVER",
					secretAccessKey: "S3RVER"
				},
				endpoint: "http://localhost:4569",
			}
			: { forcePathStyle: true };
		return new S3Client(config);
	}
}
