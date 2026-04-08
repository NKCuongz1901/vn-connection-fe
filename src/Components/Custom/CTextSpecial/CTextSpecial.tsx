import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { mainRoutes } from '@/routes/MainRoutes'
import { useLocalePath } from '@/ultis/route'

import classes from './CTextSpecial.module.scss'

const urlRegex = /(https?:\/\/[^\s]+)/g

interface CTextSpecialProps extends React.HTMLAttributes<HTMLDivElement> {
	data: string
	mentions?: any[]
}

const CTextSpecial = ({
	data: _data,
	mentions,
	...rest
}: CTextSpecialProps) => {
	const { onOpenNewRoute } = useLocalePath()
	const [nodes, setNodes] = useState([])
	const data = useMemo(() => (_data || '').trim(), [_data])
	const process = useCallback(() => {
		if (!data) return []

		// 1. Sort mentions by position_start
		const sorted = [...(mentions || [])].sort(
			(a, b) => a.position_start - b.position_start,
		)

		const result: React.ReactNode[] = []
		let cursor = 0

		sorted.forEach((m, idx) => {
			const { position_start, position_end, name, user_id } = m || {}

			// Text trước tag
			if (cursor < position_start) {
				result.push(data.slice(cursor, position_start))
			}

			// Tag
			result.push(
				<span
					key={`tag-${idx}`}
					className={classes.tag}
					onClick={() =>
						!!user_id && onOpenNewRoute(`${mainRoutes.profile}/${user_id}`)
					}
				>
					@{name}
				</span>,
			)

			cursor = position_end
		})

		// Phần cuối sau tag
		if (cursor < data.length) result.push(data.slice(cursor))

		// 2. Detect link trong những phần KHÔNG phải tag
		const final: React.ReactNode[] = []

		result.forEach((part, i) => {
			if (typeof part !== 'string') {
				final.push(part)
				return
			}

			const chunks = part.split(urlRegex)

			chunks.forEach((c, idx2) => {
				if (urlRegex.test(c)) {
					final.push(
						<a
							key={`link-${i}-${idx2}`}
							href={c}
							target="_blank"
							rel="noopener noreferrer"
							className="link"
						>
							{c}
						</a>,
					)
				} else {
					final.push(c)
				}
			})
		})

		return final
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data, JSON.stringify(mentions)])

	useEffect(() => {
		setNodes(process())
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data, JSON.stringify(mentions)])

	return (
		<div className={classes.wrapper} {...rest}>
			{nodes}
		</div>
	)
}

export default CTextSpecial
