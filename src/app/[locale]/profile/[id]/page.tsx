'use client'
import React, { memo } from 'react'

import Profile from '@/Container/Profile'
import { useLocalePath } from '@/ultis/route.ults'

const Page = () => {
	const { onGetParam } = useLocalePath()
	const { id } = onGetParam() as any
	return <Profile id={id} />
}

export default memo(Page)
