'use client'
import { useMemo } from 'react'
import AgoraRTC, { AgoraRTCProvider } from 'agora-rtc-react'

export default function DetailTalkroomAgoraProvider({
	children,
}: {
	children: React.ReactNode
}) {
	const client = useMemo(
		() => AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' }),
		[],
	)
	return <AgoraRTCProvider client={client}>{children}</AgoraRTCProvider>
}
