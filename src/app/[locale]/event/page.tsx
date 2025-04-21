import { memo } from 'react'

import Event from '@/Container/Event'
import { mainRoutes } from '@/routes/MainRoutes'

const Page = () => {
	return <Event type={mainRoutes.event} />
}

export default memo(Page)
