import { memo } from 'react'

import UpcomingEvent from '@/Container/UpcomingEvent'
import { mainRoutes } from '@/routes/MainRoutes'

const Page = () => {
	return <UpcomingEvent type={mainRoutes.upcomingEvent} hiddenAdd />
}

export default memo(Page)
