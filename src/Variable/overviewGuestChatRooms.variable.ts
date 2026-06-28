import { LanguageProps } from '@/interface/Conversation/Conversation.interface'

export type OverviewGuestChatRoomItem = Pick<
	LanguageProps,
	'id' | 'name' | 'code' | 'flag'
>

export const OVERVIEW_GUEST_CHAT_ROOMS: OverviewGuestChatRoomItem[] = [
	{
		id: 'e471601d-8d8f-4686-8065-0ace6d98b06b',
		name: 'English',
		code: 'en',
		flag: 'https://d3os4mdotxj1mv.cloudfront.net/medium/image-1746626488889-c2dbdfa5-0ff8-4249-bcc1-95bea6a5a6d3.webp',
	},
	{
		id: '435a86b0-3e69-4962-bbd5-aa13e03ed40d',
		name: 'Vietnamese',
		code: 'vi',
		flag: 'https://d3os4mdotxj1mv.cloudfront.net/medium/image-1746622516436-1f2e3012-9973-4ab0-a3c8-76fdb6cbb13c.webp',
	},
	{
		id: '9cc4cd4d-7723-4da8-a9b0-9bfee9576417',
		name: 'Chinese',
		code: 'zh',
		flag: 'https://d3os4mdotxj1mv.cloudfront.net/medium/image-1746622693442-4cda64d2-4f10-48c0-9f89-204f533066d5.webp',
	},
	{
		id: '6403d7b0-37cd-4e7c-8e8b-5585568444ac',
		name: 'Spanish',
		code: 'es',
		flag: 'https://d3os4mdotxj1mv.cloudfront.net/medium/image-1746626271990-855b2538-34be-4735-a8c7-81fab77c3cec.webp',
	},
	{
		id: '23fd8424-2c52-49a3-8cd6-7a2644b273d5',
		name: 'French',
		code: 'fr',
		flag: 'https://d3os4mdotxj1mv.cloudfront.net/medium/image-1746622945243-31e4476d-777d-4181-b140-deabaf979a25.webp',
	},
	{
		id: 'b9307856-6054-42c7-942c-e98230ebde29',
		name: 'German',
		code: 'de',
		flag: 'https://d3os4mdotxj1mv.cloudfront.net/medium/image-1746622891316-5c1ed7d4-fc3c-4438-b331-32ad6370dd06.webp',
	},
	{
		id: 'b1fb0e2e-6962-4f2d-9071-ad55d0ccc216',
		name: 'Japanese',
		code: 'ja',
		flag: 'https://d3os4mdotxj1mv.cloudfront.net/medium/image-1746622751284-5dae68ea-ebdf-4b83-a8f5-9ce0424b7804.webp',
	},
	{
		id: '07f4b465-7859-4977-9051-90fa83bde43d',
		name: 'Korean',
		code: 'ko',
		flag: 'https://d3os4mdotxj1mv.cloudfront.net/medium/image-1746622793142-cc593830-05a5-492f-a1af-41417873db2b.webp',
	},
	{
		id: '5813f304-2a0c-4309-8cd1-06ee6509eafc',
		name: 'Russian',
		code: 'ru',
		flag: 'https://d3os4mdotxj1mv.cloudfront.net/medium/image-1746626420913-e23412c5-856e-4bf9-980d-b9e67543405b.webp',
	},
	{
		id: 'e3794bec-dab3-44b0-abb8-d89183d22e62',
		name: 'Arabic',
		code: 'ar',
		flag: 'https://d3os4mdotxj1mv.cloudfront.net/medium/image-1746626331597-bf81cfec-853a-48c8-92f0-8365f58d2189.webp',
	},
	{
		id: '15843788-fa0f-4cf4-a454-a98af1c0da58',
		name: 'Portuguese',
		code: 'pt',
		flag: 'https://d3os4mdotxj1mv.cloudfront.net/medium/image-1750432645513-b2f6da94-5a00-491f-a17f-747339d6c87c.webp',
	},
	{
		id: '17b897b8-eb79-4153-91f7-fe55729ef27e',
		name: 'Hindi',
		code: 'hi',
		flag: 'https://d3os4mdotxj1mv.cloudfront.net/medium/image-1750432570025-9a2099e0-22cc-409c-9b7d-2849088ebcd2.webp',
	},
	{
		id: '4b277aea-59b5-4189-be87-f5bb99160878',
		name: 'Italian',
		code: 'it',
		flag: 'https://d3os4mdotxj1mv.cloudfront.net/medium/image-1750432411675-76c52ffc-fd57-42ba-9507-74e81651c1d9.webp',
	},
	{
		id: '6502b777-2cbf-4c52-9a48-3523870d682a',
		name: 'Thai',
		code: 'th',
		flag: 'https://d3os4mdotxj1mv.cloudfront.net/medium/image-1750432466957-550c5c70-a3e4-4584-a47a-3fb19083790e.webp',
	},
	{
		id: '26d85b85-a41e-471a-bdd1-4b0443738b89',
		name: 'Indonesian',
		code: 'id',
		flag: 'https://d3os4mdotxj1mv.cloudfront.net/medium/image-1750432602888-d26ff1a9-d327-4533-a48b-87021cec6851.webp',
	},
]

export const OVERVIEW_GUEST_CHAT_ROOM_COUNT = OVERVIEW_GUEST_CHAT_ROOMS.length
