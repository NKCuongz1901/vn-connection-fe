import { IconDots } from '@tabler/icons-react'
import { Dropdown, Flex } from 'antd'
import { CSSProperties, memo } from 'react'

import useUserMoreAction from '@/hooks/User/useUserMoreAction'

import ModalReport from '../../Custom/ModalReport'

const UserMoreAction = (props: {
	id: string
	isFriend?: any
	isNotBlock?: boolean
	isProfile?: boolean
	iconDotsStyle?: CSSProperties
	onCallback?: any
	[key: string]: any
}) => {
	const { iconDotsStyle = {} } = props
	const { loading, menus, open, onClose } = useUserMoreAction(props)
	return (
		<Flex onClick={(e) => e.stopPropagation()}>
			<Dropdown disabled={loading} menu={{ items: menus }} trigger={['click']}>
				<IconDots style={{ cursor: 'pointer', ...iconDotsStyle }} />
			</Dropdown>
			{open.open && (
				<ModalReport
					title="Report"
					open={open.open}
					data={{ user_id: open.data }}
					onClose={onClose}
				/>
			)}
		</Flex>
	)
}

export default memo(UserMoreAction)
