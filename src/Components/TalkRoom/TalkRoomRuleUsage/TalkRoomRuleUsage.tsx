'use client'

import { IconChevronRight } from '@tabler/icons-react'
import { memo } from 'react'

import BookIcon from '@/svg/BookIcon'

import classes from './TalkRoomRuleUsage.module.scss'

export type TalkRoomRuleUsageProps = {
	onClick?: () => void
}

function TalkRoomRuleUsage({ onClick }: TalkRoomRuleUsageProps) {
	return (
		<div className={classes.wrapper}>
			<div className={classes.divider} />
			<button type="button" className={classes.item} onClick={onClick}>
				<div className={classes.iconWrap}>
					<BookIcon fill="#006B35" width={24} height={24} />
				</div>
				<span className={classes.label}>Rule for usage</span>
				<div className={classes.chevronWrap}>
					<IconChevronRight size={16} stroke={1.5} />
				</div>
			</button>
		</div>
	)
}

export default memo(TalkRoomRuleUsage)
