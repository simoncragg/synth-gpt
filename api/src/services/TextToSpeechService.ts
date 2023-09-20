import FileManager from "./FileManager";
import { performTextToSpeech } from "@clients/pollyApiClient";

export default class TextToSpeechService {
	private readonly fileManager: FileManager;

	constructor() {
		this.fileManager = new FileManager(process.env.S3_AUDIO_BUCKET_NAME);
	}

	async generateSignedAudioUrlAsync(transcript: string): Promise<URL> {
		const audioByteArray = await performTextToSpeech(transcript);
		const filename = `${Date.now()}.mpg`;
		return await this.fileManager.writeAsync(filename, audioByteArray);
	}
}
