import DetailTalkroom from '@/Container/TalkRoom/DetailTalkroom/DetailTalkroom'
import DetailTalkroomAgoraProvider from '@/context/DetailTalkroomAgoraProvider'
import React from 'react'

export default async function Page({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id } = await params
	return (
		<DetailTalkroomAgoraProvider>
			<DetailTalkroom id={id} />
		</DetailTalkroomAgoraProvider>
	)
}
