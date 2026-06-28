import { IconDots } from '@tabler/icons-react'
import { Dropdown, Flex, Skeleton } from 'antd'
import { ItemType } from 'antd/es/menu/interface'
import { memo } from 'react'

import { arrayFrom, isArray } from '@/ultis/array'
import { getDiffFromNow } from '@/ultis/date'
import { useLocalePath } from '@/ultis/route'

import CAvatar from '@/Components/Custom/CAvatar'
import CImage from '@/Components/Custom/CImage'
import CTextSpecial from '@/Components/Custom/CTextSpecial'
import Heart from '@/svg/Heart'
import ShareIconSvg from '@/svg/ShareIconSvg'

import { mainRoutes } from '@/routes/MainRoutes'

import { AnnouncementProps } from '@/interface/Community/Community.interface'
import { DEFAULT_FALLBACK } from '@/Variable/common.variable'

import classes from './DetailCommunityAnnou.module.scss'

interface DetailCommunityAnnouProps {
	announceList: AnnouncementProps[]
	loading?: boolean
	onAction?: any
	onGetMenus?: any
	isPublic?: boolean
	onRequireLogin?: () => void
}
const DetailCommunityAnnou = (props: DetailCommunityAnnouProps) => {
	const { onChangeRoute } = useLocalePath()
	const { loading, announceList, onAction, onGetMenus, isPublic, onRequireLogin } =
		props

	const handleProfileClick = (userId: string) => {
		if (isPublic) {
			onRequireLogin?.()
			return
		}
		onChangeRoute(mainRoutes.profile + `/${userId}`)
	}
	const _renderBody = (item: AnnouncementProps) => {
		const { description, title, user, created_at, medias } = item || {}
		const { avatar, id: user_id, name } = user || {}
		const { value: timeAgo, unit } = getDiffFromNow({ input: created_at })

		return (
			<Flex vertical className={classes.body}>
				<Flex className={classes.bodyHeader}>
					<CAvatar
						src={avatar}
						onClick={() => handleProfileClick(user_id)}
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
						medias.map((item) => {
							const { thumbnail, url, type } = item || {}
							const isImg = type === 'IMAGE'
							return (
								<Flex key={url} className={classes.media}>
									{isImg ? (
										<CImage preview src={thumbnail || url} />
									) : (
										<video
											preload="none"
											controls
											poster={thumbnail || DEFAULT_FALLBACK}
										>
											<source src={url} type="video/mp4" />
										</video>
									)}
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

	const _renderFooter = (item: AnnouncementProps) => {
		const { id, is_liked, amount_of_like, user_id } = item || {}
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
							if (onAction) {
								onAction({ key: 'like', value: id })
							}
						}}
					>
						<Heart fill={is_liked ? '#F80024' : '#94A3B8'} /> {amount_of_like}
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

	const _renderSkeleton = () => {
		return (
			<Flex className={classes.container} vertical>
				{arrayFrom(3).map((_, index) => (
					<Skeleton.Input key={index} active className={classes.skeleton} />
				))}
			</Flex>
		)
	}

	if (loading) {
		return <div className={classes.wrapper}>{_renderSkeleton()}</div>
	}
	return (
		<div className={classes.wrapper}>
			<Flex vertical className={classes.container}>
				{isArray(announceList, 1) ? (
					announceList.map((item) => {
						const { id } = item || {}
						return (
							<Flex key={id} vertical className={classes.annouWrapper}>
								{_renderBody(item)}
								{_renderFooter(item)}
							</Flex>
						)
					})
				) : (
					<></>
				)}
			</Flex>
		</div>
	)
}

export default memo(DetailCommunityAnnou)
