'use client'

import { Upload, UploadProps } from 'antd'
import { memo } from 'react'

import classes from './CUpload.module.scss'

const CUpload = (_props: UploadProps) => {
	const { children, ...props } = _props
	return (
		<div className={classes.layout}>
			<Upload
				className={classes.wrapper}
				showUploadList={false}
				maxCount={1}
				accept="image/*"
				beforeUpload={() => false}
				{...props}
			>
				{children}
			</Upload>
		</div>
	)
}

export default memo(CUpload)
