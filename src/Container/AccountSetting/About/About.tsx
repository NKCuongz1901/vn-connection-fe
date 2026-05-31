'use client'

import { getSystemSettings } from '@/apis/authApis'
import React, { useEffect, useState } from 'react'

import classes from './About.module.scss'

function About() {
	const [html, setHtml] = useState('')

	useEffect(() => {
		const fetchAbout = async () => {
			try {
				const res: any = await getSystemSettings({
					params: {
						fields: ['value'],
						filter: { field: 'ABOUT' },
					},
				})
				setHtml(res?.results?.objects?.rows?.[0]?.value ?? '')
			} catch {}
		}
		fetchAbout()
	}, [])

	return (
		<div
			className={classes.content}
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	)
}

export default About
