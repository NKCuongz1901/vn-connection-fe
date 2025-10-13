'use client'

import { memo } from 'react'

import { useQuery } from '@/ultis/route.ults'

import DetailCommunity from '@/Container/Community/DetailCommunity'

const Page = () => {
	const { onGetParams } = useQuery()
	const id = onGetParams('id') as string
	return <DetailCommunity id={id} />
}

export default memo(Page)
