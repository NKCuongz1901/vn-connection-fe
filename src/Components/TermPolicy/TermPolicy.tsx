'use client'

import { Flex } from 'antd'
import { memo } from 'react'
import Link from 'next/link'

import { useLocalePath } from '@/ultis/route'
import { mainRoutes } from '@/routes/MainRoutes'
import { buildVersion } from '../../../utils/version'

import classes from './TermPolicy.module.scss'

type TermPolicyProps = {
	align?: 'center' | 'start'
	/** stack = tall vertical (auth); inline = short horizontal (app footer) */
	layout?: 'stack' | 'inline'
	className?: string
}

/** Company legal / contact footer. */
function TermPolicy({
	align = 'center',
	layout = 'stack',
	className,
}: TermPolicyProps) {
	const { onGetPath } = useLocalePath()

	const links = (
		<>
			<Link href={onGetPath(mainRoutes.term)}>Terms of Use</Link>
			<Link href={onGetPath(mainRoutes.policy)}>Privacy Policy</Link>
		</>
	)

	const contact = (
		<a href="mailto:support@univini.com" className={classes.mail}>
			support@univini.com
		</a>
	)

	if (layout === 'inline') {
		return (
			<div
				className={`${classes.inline} ${className || ''}`}
				style={{ textAlign: align === 'start' ? 'left' : 'center' }}
			>
				<span className={classes.inlineRow}>
					<Link
						className={classes.item}
						href={onGetPath(mainRoutes.term)}
					>
						Terms of Use
					</Link>
					<Link
						className={classes.item}
						href={onGetPath(mainRoutes.policy)}
					>
						Privacy Policy
					</Link>
					<span className={classes.item}>
						VN CONNECTIONS COMPANY LIMITED
					</span>
					<span className={classes.item}>Contact: {contact}</span>
					<span className={classes.item}>Version: {buildVersion}</span>
				</span>
				<span className={classes.inlineRow}>
					<span className={classes.address}>
						Address: 2A Phan Tay Ho, Ward 7, Phu Nhuan District, Ho Chi
						Minh City, Viet Nam, 700000
					</span>
					<span className={classes.item}>
						© 2026 VN CONNECTIONS COMPANY LIMITED. All rights reserved.
					</span>
				</span>
			</div>
		)
	}

	return (
		<Flex
			vertical
			justify="center"
			align={align === 'start' ? 'flex-start' : 'center'}
			gap={4}
			className={`${classes.stack} ${className || ''}`}
		>
			<Flex gap={12}>{links}</Flex>
			<span>VN CONNECTIONS COMPANY LIMITED</span>
			<span
				style={{
					textAlign: align === 'start' ? 'left' : 'center',
					maxWidth: 360,
				}}
			>
				Address: 2A Phan Tay Ho, Ward 7, Phu Nhuan District, Ho Chi Minh
				City, Viet Nam, 700000
			</span>
			<span>Contact: {contact}</span>
			<span>
				© 2026 VN CONNECTIONS COMPANY LIMITED. All rights reserved.
			</span>
			<span>Version: {buildVersion}</span>
		</Flex>
	)
}

export default memo(TermPolicy)
