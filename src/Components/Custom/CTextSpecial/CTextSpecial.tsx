import React, { useCallback, useEffect, useState } from 'react'
import classes from './CTextSpecial.module.scss'

const urlRegex = /(https?:\/\/[^\s]+)/g

interface CTextSpecialProps extends React.HTMLAttributes<HTMLDivElement> {
	data: string
}
const CTextSpecial = ({ data, ...rest }: CTextSpecialProps) => {
	const [content, setContent] = useState([])

	const handleSetText = useCallback((text) => {
		if (!text) return []

		const parts = text.split(urlRegex)
		return parts.map((part, idx) => {
			if (urlRegex.test(part)) {
				return (
					<a
						key={idx}
						href={part}
						target="_blank"
						rel="noopener noreferrer"
						className={classes.link}
						onClick={(e) => e.stopPropagation()}
					>
						{part}
					</a>
				)
			}
			return <span key={idx}>{part}</span>
		})
	}, [])

	useEffect(() => {
		setContent(handleSetText(data))
	}, [data, handleSetText])

	return (
		<div className={classes.wrapper} {...rest}>
			{content}
		</div>
	)
}

export default CTextSpecial
