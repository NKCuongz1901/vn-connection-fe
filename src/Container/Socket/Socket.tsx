import React from 'react'
import useSocket from './useSocket'
import CButton from '@/Components/Custom/CButton'
import { Flex } from 'antd'

import classes from './Socket.module.scss'
import CInput from '@/Components/Custom/CInput'

const Socket = () => {
	const { data, setData, message, onSocket } = useSocket()
	return (
		<div className={classes.wrapper}>
			<CInput
				label="token"
				value={data.token}
				onChange={(e) =>
					setData((prev) => ({ ...prev, token: e.target.value }))
				}
			/>
			<CInput
				label="uid"
				value={data.uid}
				onChange={(e) => setData((prev) => ({ ...prev, uid: e.target.value }))}
			/>
			<CButton onClick={onSocket}>Connect socket 1</CButton>
			<Flex vertical className={classes.containerMessage1}>
				{message.map((item) => (
					<Flex key={item.key} className={classes[item.type]}>
						{item.type} : {item.message}
					</Flex>
				))}
			</Flex>
		</div>
	)
}

export default Socket
