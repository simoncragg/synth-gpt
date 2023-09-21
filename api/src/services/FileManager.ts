import {
	GetObjectCommand,
	PutObjectCommand,
	S3Client
} from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { isDev } from "../constants";

export default class FileManager {
	private readonly bucketName: string;
	private readonly s3Client: S3Client;
	
	constructor(bucketName: string) {
		this.bucketName = bucketName;
		this.s3Client = this.createS3Client();
	}

	async writeAsync(filePath: string, content: Uint8Array): Promise<URL> {

		await this.s3Client.send(
			new PutObjectCommand({
				Bucket: this.bucketName,
				Key: filePath,
				Body: content,
			})
		);

		const signedUrl = await getSignedUrl(
			this.s3Client,
			new GetObjectCommand({
				Bucket: this.bucketName,
				Key: filePath
			})
		);

		return new URL(signedUrl);
	}

	static determineFileExtension(mimeType: string): string {
		if (mimeType.startsWith("image/")) {
			return mimeType.substring(6);
		}
		return "txt";
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
