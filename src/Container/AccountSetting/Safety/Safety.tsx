'use client'
import { getSystemSettings } from '@/apis/authApis'
import { Flex } from 'antd'
import React, { useEffect, useState } from 'react'

import classes from './Safety.module.scss'
const mappingType = { TERMS: 'TERMS', POLICY: 'POLICY' }

const handleGetType = (type) => {
	return mappingType[type] || mappingType.POLICY
}

const mappingTitle = {
	[mappingType.POLICY]: 'Policy',
	[mappingType.TERMS]: 'Term of use',
}

const Safety = ({ type }: { type: string }) => {
	const [data, setData] = useState<{ [key: string]: any }>({})

	const handleGetData = async () => {
		try {
			const params = {
				fields: ['value'],
				filter: { field: handleGetType(type) },
			}
			const res: any = await getSystemSettings({ params })
			setData(res?.results?.objects?.rows?.[0])
		} catch {}
	}

	useEffect(() => {
		handleGetData()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [type])

	return (
		<div className={classes.wrapper}>
			<Flex vertical className={classes.container}>
				<div className={classes.title}>{mappingTitle[handleGetType(type)]}</div>
				<div
					className={classes.content}
					dangerouslySetInnerHTML={{ __html: data?.value }}
				/>
			</Flex>
		</div>
	)
}

export default Safety
