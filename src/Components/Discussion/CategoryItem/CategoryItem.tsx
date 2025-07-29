import { Flex } from 'antd'
import { memo } from 'react'

import { parseNumberToShort } from '@/ultis/string.ults'

import CButton from '@/Components/Custom/CButton'
import CImage from '@/Components/Custom/CImage'

import classes from './CategoryItem.module.scss'

interface CategoryItemProp {
	item: any
	hiddenJoin?: boolean
	onJoinCategory?: any
	loading?: boolean
	[key: string]: any
}
const CategoryItem = (props: CategoryItemProp) => {
	const { item, hiddenJoin, onJoinCategory, loading } = props || {}
	const { image, title, amount_of_user, is_liked } = item || {}
	return (
		<div className={classes.wrapper}>
			<Flex className={classes.container}>
				<Flex className={classes.Left}>
					<div className={classes.image}>
						<CImage src={image} />
					</div>
					<Flex vertical className={classes.info}>
						<div className={classes.title}> {title}</div>
						<div className={classes.numberMember}>
							{parseNumberToShort(amount_of_user)} members
						</div>
					</Flex>
				</Flex>
				{!hiddenJoin && (
					<Flex className={classes.bnt}>
						<CButton
							ctype={is_liked ? 'disabled' : 'oranger'}
							onClick={(e) => {
								e.stopPropagation()
								if (!loading && onJoinCategory) {
									onJoinCategory(item.id)
								}
							}}
						>
							{is_liked ? 'Joined' : 'Join'}
						</CButton>
					</Flex>
				)}
			</Flex>
		</div>
	)
}

export default memo(CategoryItem)
