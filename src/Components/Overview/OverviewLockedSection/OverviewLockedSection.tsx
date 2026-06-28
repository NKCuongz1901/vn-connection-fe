import { IconLock } from '@tabler/icons-react'
import { Flex } from 'antd'
import clsx from 'clsx'
import { memo, ReactNode } from 'react'

import CButton from '@/Components/Custom/CButton'

import classes from './OverviewLockedSection.module.scss'

interface OverviewLockedSectionProps {
	description: string
	onLogin: () => void
	preview?: ReactNode
	dashedBorder?: boolean
	className?: string
}

function OverviewLockedSection({
	description,
	onLogin,
	preview,
	dashedBorder = false,
	className,
}: OverviewLockedSectionProps) {
	return (
		<Flex
			className={clsx(classes.wrapper, className, {
				[classes.dashedBorder]: dashedBorder,
			})}
		>
			{preview && <div className={classes.preview}>{preview}</div>}
			<Flex vertical className={classes.lockContent} align="center">
				<Flex className={classes.lockIcon} align="center" justify="center">
					<IconLock size={20} stroke={1.5} color="#006B35" />
				</Flex>
				<span className={classes.description}>{description}</span>
				<CButton ctype="oranger" className={classes.loginBtn} onClick={onLogin}>
					Log in to continue
				</CButton>
			</Flex>
		</Flex>
	)
}

export default memo(OverviewLockedSection)
