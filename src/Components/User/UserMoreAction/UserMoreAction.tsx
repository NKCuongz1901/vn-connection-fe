import { IconDots } from '@tabler/icons-react'
import { Dropdown, Flex } from 'antd'
import { memo } from 'react'

import useUserMoreAction from '@/hooks/User/useUserMoreAction'

import ModalReport from '../../Custom/ModalReport'

const UserMoreAction = ({
	id,
	isFriend,
	onCallback,
}: {
	id: string
	isFriend?: any
	onCallback?: any
}) => {
	const { loading, menus, open, onClose } = useUserMoreAction({
		id,
		isFriend,
		onCallback,
	})
	return (
		<Flex onClick={(e) => e.stopPropagation()}>
			<Dropdown disabled={loading} menu={{ items: menus }} trigger={['click']}>
				<IconDots style={{ cursor: 'pointer' }} />
			</Dropdown>
			{open.open && (
				<ModalReport
					title="Create discussion"
					open={open.open}
					data={{ user_id: open.data }}
					onClose={onClose}
				/>
			)}
		</Flex>
	)
}

export default memo(UserMoreAction)
