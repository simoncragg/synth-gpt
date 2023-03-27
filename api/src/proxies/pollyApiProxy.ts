import { Polly, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";

const polly = new Polly({
	region: process.env.REGION,
	credentials: {
		accessKeyId: process.env.POLLY_ACCESS_KEY_ID,
		secretAccessKey: process.env.POLLY_SECRET_ACCESS_KEY,
	}
});

export async function performTextToSpeech(text: string) {
	const command = new SynthesizeSpeechCommand({
		Text: text,
		OutputFormat: "mp3",
		SampleRate: "24000",
		LanguageCode: "en-GB",
		Engine: "neural",
		VoiceId: "Arthur"
	});

	const response = await polly.send(command);
	return response.AudioStream;
}
