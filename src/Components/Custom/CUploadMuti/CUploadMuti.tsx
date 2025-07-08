'use client'

import { Upload, UploadProps } from 'antd'
import { memo } from 'react'

import classes from './CUploadMuti.module.scss'

const CUploadMuti = (_props: UploadProps) => {
	const { children, ...props } = _props
	return (
		<div className={classes.layout}>
			<Upload
				className={classes.wrapper}
				showUploadList={false}
				maxCount={5}
				accept="image/*"
				beforeUpload={() => false}
				multiple
				{...props}
			>
				{children}
			</Upload>
		</div>
	)
}

export default memo(CUploadMuti)
