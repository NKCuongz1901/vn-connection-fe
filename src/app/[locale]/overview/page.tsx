'use client'

import { memo } from 'react'

import Overview from '@/Container/Overview'
import PublicOverview from '@/Container/Overview/PublicOverview'
import { isLogin } from '@/ultis/storage'

const Page = () => {
	if (!isLogin()) {
		return <PublicOverview />
	}

	return <Overview />
}

export default memo(Page)
