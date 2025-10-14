import { IconDots } from '@tabler/icons-react'
import { Dropdown, Flex } from 'antd'
import { ItemType } from 'antd/es/menu/interface'
import clsx from 'clsx'
import { memo } from 'react'

import { isArray } from '@/ultis/array.ults'
import { getDiffFromNow } from '@/ultis/date.ults'
import { useLocalePath } from '@/ultis/route.ults'

import CAvatar from '@/Components/Custom/CAvatar'
import CImage from '@/Components/Custom/CImage'
import CTextSpecial from '@/Components/Custom/CTextSpecial'
import Heart from '@/svg/Heart'
import MessageMinuIcon from '@/svg/MessageMinuIcon'
import ShareIconSvg from '@/svg/ShareIconSvg'

import { mainRoutes } from '@/routes/MainRoutes'

import classes from './DiscussionItem.module.scss'

interface DiscussionItemProps {
	item: any
	onGetMenus: any
	onAction?: any
	onChangeUrl?: any
	noRadius?: boolean
	[key: string]: any
}
const DiscussionItem = (props: DiscussionItemProps) => {
	const { onChangeRoute } = useLocalePath()
	const {
		item,
		noRadius,
		onGetMenus,
		onAction = () => null,
		onChangeUrl = () => null,
	} = props
	const {
		user,
		category,
		created_at,
		title,
		description,
		id,
		amount_of_like,
		amount_of_comment,
		is_liked,
		medias,
	} = item || {}
	const { avatar, name, id: user_id } = user || {}
	const { title: titleCategory, image: imageCategory } = category || {}
	const { value: timeAgo, unit } = getDiffFromNow({ input: created_at })
	const _renderBody = () => {
		return (
			<Flex vertical className={classes.body}>
				<Flex className={classes.bodyHeader}>
					<CAvatar
						src={avatar}
						onClick={() => onChangeRoute(mainRoutes.profile + `/${user_id}`)}
					/>
					<span className={classes.title}>{name}</span>
					<span>
						{timeAgo} {unit ? unit + 's ago' : ''}
					</span>
				</Flex>
				<Flex className={classes.bodyText} vertical>
					<div className={classes.title}>{title}</div>
					<CTextSpecial className={classes.text} data={description} />
				</Flex>
				<Flex className={classes.medias}>
					{isArray(medias, 1) ? (
						medias.map((item, index) => {
							const { thumbnail, url } = item || {}
							return (
								<Flex key={index} className={classes.media}>
									<CImage src={thumbnail || url} />
								</Flex>
							)
						})
					) : (
						<></>
					)}
				</Flex>
			</Flex>
		)
	}
	const _renderFooter = () => {
		const menus: ItemType[] = onGetMenus({
			...item,
			id,
			user_id,
		})
		return (
			<Flex className={classes.footer}>
				<Flex className={classes.footerLeft}>
					<Flex
						className={classes.footerIcon}
						onClick={(e) => {
							e.stopPropagation()
							onAction({ key: 'like', value: id })
						}}
					>
						<Heart fill={is_liked ? '#F80024' : '#94A3B8'} /> {amount_of_like}
					</Flex>
					<div className={classes.vertical} />
					<Flex className={classes.footerIcon}>
						<MessageMinuIcon /> {amount_of_comment}
					</Flex>
					<div className={classes.vertical} />

					<div
						className={classes.footerIcon}
						onClick={(e) => {
							e.stopPropagation()
							onAction({ key: 'share', value: item })
						}}
					>
						<ShareIconSvg />
					</div>
				</Flex>
				<Flex
					className={classes.footerRight}
					onClick={(e) => e.stopPropagation()}
				>
					<Dropdown trigger={['click']} menu={{ items: menus }}>
						<IconDots color="#94A3B8" />
					</Dropdown>
				</Flex>
			</Flex>
		)
	}

	return (
		<div className={classes.wrapper}>
			<Flex
				className={clsx(classes.container, {
					[classes.containerNoRadius]: noRadius,
				})}
				vertical
				onClick={() => onChangeUrl({ key: 'id', value: item })}
			>
				{titleCategory && (
					<Flex className={classes.header}>
						<CAvatar src={imageCategory} className={classes.avatar} />
						<span>Posted on</span>
						<span className={classes.title}> {titleCategory}</span>
					</Flex>
				)}
				{_renderBody()}
				{_renderFooter()}
			</Flex>
		</div>
	)
}

export default memo(DiscussionItem)
