'use client'
import React from 'react'

import { useQuery } from '@/ultis/route'

import DetailEvent from '@/Container/Event/DetailEvent'

import { mainRoutes } from '@/routes/MainRoutes'

const Page = () => {
	const { onGetParams } = useQuery()
	const id = onGetParams('id') as string
	return <DetailEvent id={id} type={mainRoutes.upcomingEvent} />
}

export default Page
