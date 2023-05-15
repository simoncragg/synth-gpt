import { useState, useRef, useCallback, useEffect } from "react";

type AudioPlayerHook = {
	queueAudio: (audioSegment: AudioSegment) => void;
	isPlaying: boolean;
};

const useAudioPlayer = (): AudioPlayerHook => {
	const [audioQueue, setAudioQueue] = useState<AudioSegment[]>([]);
	const [isPlaying, setIsPlaying] = useState<boolean>(false);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	const playNextAudio = useCallback(() => {
		if (audioQueue.length === 0) {
			setIsPlaying(false);
			return;
		}

		const nextAudioUrl = audioQueue[0].audioUrl;
		const audio = new Audio(nextAudioUrl);

		audio.addEventListener("ended", () => {
			setAudioQueue((prevQueue) => prevQueue.slice(1));
		});

		audioRef.current = audio;

		audio.play().catch((err) => {
			console.error(`Failed to play audio: ${err}`);
			setIsPlaying(false);
		});
	}, [audioQueue]);

	const queueAudio = useCallback(
		(audioSegment: AudioSegment) => {
			setAudioQueue((prevQueue) =>
				[...prevQueue, audioSegment].sort((a, b) => a.timestamp - b.timestamp)
			);

			if (!isPlaying) {
				setIsPlaying(true);
				setTimeout(() => playNextAudio(), 200);
			}
		},
		[isPlaying, playNextAudio]
	);

	useEffect(() => {
		if (!audioRef.current || audioRef.current.ended) {
			playNextAudio();
		}
	}, [audioQueue, playNextAudio]);

	return {
		queueAudio,
		isPlaying,
	};
};

export default useAudioPlayer;
