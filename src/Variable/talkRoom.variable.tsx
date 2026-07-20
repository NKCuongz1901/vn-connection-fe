/** Role server / in-room (RoomMateRole ≈ RoomUserRole) */
export const TALK_ROOM_ROLE = {
	HOST: 'host',
	SPEAKER: 'speaker',
	LISTENER: 'listener',
} as const
export type TalkRoomRole = (typeof TALK_ROOM_ROLE)[keyof typeof TALK_ROOM_ROLE]

export const TALK_ROOM_AGORA_ROLE = {
	AUDIENCE: 'audience',
	SPEAKER: 'speaker',
	HOST: 'host',
} as const
export type TalkRoomAgoraRole =
	(typeof TALK_ROOM_AGORA_ROLE)[keyof typeof TALK_ROOM_AGORA_ROLE]

export const TALK_ROOM_CONNECTION_TYPE = {
	AGORA_RTC: 'agora_rtc',
	MEDIA_SERVER: 'media_server',
} as const
export type TalkRoomConnectionType =
	(typeof TALK_ROOM_CONNECTION_TYPE)[keyof typeof TALK_ROOM_CONNECTION_TYPE]

export const TALK_ROOM_JOIN_REASON = {
	SUCCESS: 'SUCCESS',
	ROOM_NOT_FOUND: 'ROOM_NOT_FOUND',
	USER_KICKED: 'USER_KICKED',
	USER_ALREADY_JOINED: 'USER_ALREADY_JOINED',
	ROOM_FULL: 'ROOM_FULL',
	ALREADY_IN_ANOTHER_ROOM_ACTIVE: 'ALREADY_IN_ANOTHER_ROOM_ACTIVE',
	ALREADY_IN_ANOTHER_ROOM: 'ALREADY_IN_ANOTHER_ROOM',
	ROOM_NOT_AVAILABLE: 'ROOM_NOT_AVAILABLE',
	ROOM_NOT_LIVE_YET: 'ROOM_NOT_LIVE_YET',
	HOST_NOT_JOINED: 'HOST_NOT_JOINED',
	NONE: 'NONE',
} as const
export type TalkRoomJoinReason =
	(typeof TALK_ROOM_JOIN_REASON)[keyof typeof TALK_ROOM_JOIN_REASON]

export const HOST_TIME_TO_JOIN_FIRST = 10 * 60
