import { memo } from 'react'
import clsx from 'clsx'

import { MINI_APP_ITEMS, MINI_APP_GRADIENT } from '@/Variable/miniApp.variable'
import { useLocalePath } from '@/ultis/route'
import MiniAppButton, {
	MiniAppButtonSize,
} from '../MiniAppButton/MiniAppButton'
import classes from './MiniAppList.module.scss'

type MiniAppListProps = {
	size?: MiniAppButtonSize
	className?: string
}

const MiniAppList = ({ size = 'sm', className }: MiniAppListProps) => {
	const { onChangeRoute } = useLocalePath()

	return (
		<div className={clsx(classes.list, classes[size], className)}>
			{MINI_APP_ITEMS.map(
				({ id, label, variant, Icon, route, availableOnWeb }) => (
					<MiniAppButton
						key={id}
						size={size}
						label={label}
						background={MINI_APP_GRADIENT[variant]}
						icon={<Icon fill="#fff" />}
						disabled={!availableOnWeb}
						onClick={() => {
							if (availableOnWeb && route) onChangeRoute(route)
						}}
					/>
				),
			)}
		</div>
	)
}

export default memo(MiniAppList)
