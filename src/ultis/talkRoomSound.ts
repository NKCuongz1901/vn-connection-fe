export const TALK_ROOM_SOUNDS = {
	newListener: '/sound/new_listener.mp3',
	endRoom: '/sound/end_room.wav',
	raiseHand: '/sound/raise_hand_sound.wav',
} as const

export type TalkRoomSoundKind = keyof typeof TALK_ROOM_SOUNDS

const talkRoomSoundCache: Partial<Record<TalkRoomSoundKind, HTMLAudioElement>> =
	{}

export const playTalkRoomSound = (kind: TalkRoomSoundKind) => {
	if (typeof window === 'undefined') return

	try {
		let audio = talkRoomSoundCache[kind]

		if (!audio) {
			audio = new Audio(TALK_ROOM_SOUNDS[kind])
			talkRoomSoundCache[kind] = audio
		}

		audio.currentTime = 0
		void audio.play().catch(() => {})
	} catch {
		// Ignore missing asset / autoplay blocks.
	}
}
