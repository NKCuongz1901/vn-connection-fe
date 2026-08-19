'use client'

import { memo } from 'react'

import MiniAppList from '@/Components/MiniApp/MiniAppList'

import classes from './MiniAppsHub.module.scss'

function MiniAppsHub() {
	return (
		<div className={classes.page}>
			<div className={classes.title}>Mini apps</div>
			<div className={classes.desc}>
				Books & Audio is available on web. Other mini apps stay in the
				UniVini app.
			</div>
			<MiniAppList />
		</div>
	)
}

export default memo(MiniAppsHub)
