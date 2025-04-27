'use client'
import React from 'react'

import { useQuery } from '@/ultis/route.ults'

import DetailEvent from '@/Container/Event/DetailEvent'

const Page = () => {
	const { onGetParams } = useQuery()
	const id = onGetParams('id') as string
	return <DetailEvent id={id} />
}

export default Page
