import { IconDots } from '@tabler/icons-react'
import { Dropdown, Flex } from 'antd'
import { ItemType } from 'antd/es/menu/interface'
import clsx from 'clsx'
import { memo } from 'react'

import useCommentItem from '@/hooks/Comment/CommentItem/useCommentItem'

import { getDiffFromNow } from '@/ultis/date.ults'

import CAvatar from '@/Components/Custom/CAvatar'
import ModalReport from '@/Components/Custom/ModalReport'
import Heart from '@/svg/Heart'
import MessageMinuIcon from '@/svg/MessageMinuIcon'

import classes from './CommentItem.module.scss'

interface CommentItemProps {
	item: any
	onGetMenus: any
	onAction?: any
	isLoading?: boolean
}

const CommentItem = ({
	item,
	onGetMenus = () => null,
	onAction = () => null,
	isLoading = false,
}: CommentItemProps) => {
	const {
		commentList,
		modal,
		deleteLoading,
		setModal,
		onGetMenus: onGetMenusItem,
		onAction: onActionItem,
	} = useCommentItem({ item, onAction })
	const {
		id,
		user,
		created_at,
		content,
		is_liked,
		amount_of_like,
		amount_of_replies,
	} = item || {}

	const { avatar, name } = user || {}
	const { value: timeAgo, unit } = getDiffFromNow({ input: created_at })
	const commentMenus: ItemType[] = onGetMenus(item)
	const _renderCommentChild = (item) => {
		const { id, user, created_at, content, is_liked, amount_of_like } =
			item || {}
		const { value: timeAgo, unit } = getDiffFromNow({ input: created_at })

		const { avatar, name } = user || {}
		const itemMenus = onGetMenusItem(item)
		return (
			<Flex
				className={clsx(classes.commentItem, {
					[classes.loading]: isLoading || deleteLoading.includes(id),
				})}
			>
				<Flex className={classes.avatar}>
					<CAvatar src={avatar} />
				</Flex>
				<Flex className={classes.right} vertical>
					<Flex className={classes.commentInfo} vertical>
						<Flex className={classes.info}>
							<Flex className={classes.infoText}>
								<span>{name}</span>
								<span>
									{timeAgo} {unit ? unit + 's ago' : ''}
								</span>
							</Flex>
						</Flex>
						<Flex className={classes.content}>{content}</Flex>
					</Flex>
					<Flex className={classes.footer}>
						<Flex
							className={classes.footerIcon}
							onClick={(e) => {
								e.stopPropagation()
								onActionItem({ key: 'like', value: id })
							}}
						>
							<Heart fill={is_liked ? '#F80024' : '#94A3B8'} /> {amount_of_like}
						</Flex>
						<div className={classes.vertical} />
						<Flex className={classes.footerIcon}>
							<MessageMinuIcon />
						</Flex>
						<div className={classes.vertical} />
						<Flex className={classes.footerIcon}>
							<Dropdown menu={{ items: itemMenus }} trigger={['click']}>
								<IconDots />
							</Dropdown>
						</Flex>
					</Flex>
				</Flex>
			</Flex>
		)
	}
	const _renderCommentChildren = () => {
		return (
			<Flex vertical className={classes.wrapperChildren}>
				{(commentList || []).map((item) => _renderCommentChild(item))}
			</Flex>
		)
	}
	const _renderModal = () => {
		const { type, data } = modal || {}
		let Content = <></>
		const propsModal = {
			open: true,
			onCancel: () => setModal({}),
			onClose: () => setModal({}),
		}
		switch (type) {
			case 'report':
				Content = (
					<ModalReport
						open
						{...propsModal}
						data={{ comment_id: data }}
						title={'Report'}
						message={'You want to report this comment ?'}
					/>
				)
				break

			default:
				break
		}
		return Content
	}
	return (
		<div className={classes.wrapper}>
			<Flex
				className={clsx(classes.commentItem, { [classes.loading]: isLoading })}
			>
				<Flex className={classes.avatar}>
					<CAvatar src={avatar} />
				</Flex>
				<Flex className={classes.right} vertical>
					<Flex className={classes.commentInfo} vertical>
						<Flex className={classes.info}>
							<Flex className={classes.infoText}>
								<span>{name}</span>
								<span>
									{timeAgo} {unit ? unit + 's ago' : ''}
								</span>
							</Flex>
						</Flex>
						<Flex className={classes.content}>{content}</Flex>
					</Flex>
					<Flex className={classes.footer}>
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
							<MessageMinuIcon /> {amount_of_replies}
						</Flex>
						<div className={classes.vertical} />
						<Flex className={classes.footerIcon}>
							<Dropdown menu={{ items: commentMenus }} trigger={['click']}>
								<IconDots />
							</Dropdown>
						</Flex>
					</Flex>
					{/* {_renderCommentChildren()} */}
				</Flex>
			</Flex>
			{_renderModal()}
		</div>
	)
}

export default memo(CommentItem)
