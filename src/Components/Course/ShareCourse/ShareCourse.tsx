import React from 'react'
import classes from './ShareCourse.module.scss'

import ShopIcon from '@/svg/ShopIcon'
import ShareIcon from '@/svg/FriendSvg/ShareIcon'

type ShareCourseProps = {
	onShare?: () => void
}

function ShareCourse({ onShare }: ShareCourseProps) {
	return (
		<div className={classes.container}>
			<div className={classes.leftSection}>
				<div className={classes.iconWrapper}>
					<ShopIcon fill="#fff" />
				</div>
				<div className={classes.textWrapper}>
					<p className={classes.textTitle}>Share & earn 10% per sale</p>
					<p className={classes.textContent}>
						Invite 10 friends for a free course
					</p>
				</div>
			</div>
			<button
				type="button"
				className={classes.rightSection}
				onClick={onShare}
			>
				<ShareIcon fill="#000" />
				<p className={classes.textShare}>Share all course</p>
			</button>
		</div>
	)
}

export default ShareCourse
