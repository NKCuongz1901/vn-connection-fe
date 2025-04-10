'use client'
import { Flex } from 'antd'
import React, { memo } from 'react'

import '../MainLayout.scss'

const AuthLayout = ({ children }) => {
	return (
		<Flex
			vertical
			className="wrapperContainerMainLayout"
			style={{
				background: 'white',
				color: 'black',
				height: '100vh',
				fontSize: 14,
				overflow: 'auto',
			}}
		>
			{children}
		</Flex>
	)
}

export default memo(AuthLayout)
