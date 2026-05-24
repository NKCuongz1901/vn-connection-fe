import { Flex } from 'antd'
import { MINI_APP_ITEMS, MINI_APP_GRADIENT } from '@/Variable/miniApp.variable'
import { useLocalePath } from '@/ultis/route'
import MiniAppButton from '../MiniAppButton/MiniAppButton'
import classes from './MiniAppList.module.scss'
import { memo } from 'react'

const MiniAppList = () => {
	const { onChangeRoute } = useLocalePath()

	return (
		<Flex className={classes.list}>
			{MINI_APP_ITEMS.map(({ id, label, variant, Icon, route }) => (
				<MiniAppButton
					key={id}
					label={label}
					background={MINI_APP_GRADIENT[variant]}
					icon={<Icon fill="#fff" />}
					onClick={() => route && onChangeRoute(route)}
				/>
			))}
		</Flex>
	)
}

export default memo(MiniAppList)
