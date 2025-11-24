'use client'

import { memo } from 'react'

import { useQuery } from '@/ultis/route.ults'
import DetailChatRoom from '@/Container/ChatRoom/DetailChatRoom'

const Page = () => {
	const { onGetParams } = useQuery()
	const id = onGetParams('id') as string
	return <DetailChatRoom id={id} />
}

export default memo(Page)
