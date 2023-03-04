import fetch from "node-fetch";

export async function generateAudioStreamAsync(text: string) {

	const voiceId = "TxGEqnHWrfWFTfGW9XjX";
	const apiUrl = `${process.env.ELEVEN_LABS_API_BASE_URL}/text-to-speech/${voiceId}`;
	const apiKey = process.env.ELEVEN_LABS_API_KEY;

	const request = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"xi-api-key": apiKey,
		},
		body: JSON.stringify({
			text,
			voice_settings: {
				stability: 0,
				similarity_boost: 0
			}
		}),
	};

	const response = await fetch(apiUrl, request);
	return await response.arrayBuffer();
}
