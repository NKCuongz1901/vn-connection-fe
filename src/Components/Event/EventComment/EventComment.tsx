import { IconDots } from '@tabler/icons-react'
import { Dropdown, Flex, Skeleton } from 'antd'
import { ItemType } from 'antd/es/menu/interface'
import clsx from 'clsx'
import { memo } from 'react'

import { arrayFrom } from '@/ultis/array.ults'
import { getDateInfo } from '@/ultis/date.ults'
import { getUserInfo } from '@/ultis/storage.ults'
import { copyToClipboard } from '@/ultis/string.ults'

import CAvatar from '@/Components/Custom/CAvatar'
import CTextArea from '@/Components/Custom/CTextArea'
import useEventComment from '@/hooks/Event/useEventComment'
import SendIcon from '@/svg/Event/SendIcon'

import classes from './EventComment.module.scss'

const EventComment = ({ id }) => {
	const {
		_parentRef,
		_childRef,
		loading,
		commentList,
		total,
		commentContent,
		deleteLoading,
		onChangeComment,
		onSendComment,
		onDeletePost,
		onScroll,
		onKeyDown,
	} = useEventComment({
		id,
	})
	const _renderSendCommentBox = () => {
		return (
			<Flex className={classes.commentBox}>
				<CTextArea
					allowClear={false}
					placeholder="What's on my mind ?"
					value={commentContent}
					autoSize={{ minRows: 3, maxRows: 3 }}
					onChange={onChangeComment}
					onKeyDown={onKeyDown}
				/>
				<Flex
					className={clsx(classes.iconSend, {
						[classes.disabled]: !commentContent.trim(),
					})}
					onClick={onSendComment}
				>
					<SendIcon />
				</Flex>
			</Flex>
		)
	}

	const _renderItemComment = (item) => {
		const { id, user, updated_at, user_id, content } = item || {}
		const { avatar, name } = user || {}
		const isMe = user_id === getUserInfo('id')
		const { dmy } = getDateInfo(updated_at)
		const isLoading = deleteLoading.includes(id)
		const commentMenus: ItemType[] = [
			{
				key: 'copy',
				label: 'Copy',
				onClick: () => copyToClipboard(content),
			},
			...(isMe
				? [
						{
							key: 'delete',
							label: 'Delete',
							style: { color: '#F80024' },
							onClick: () => onDeletePost(id),
						},
				  ]
				: []),
		]

		return (
			<Flex
				key={id}
				className={clsx(classes.commentItem, { [classes.loading]: isLoading })}
			>
				<Flex className={classes.avatar}>
					<CAvatar src={avatar} />
				</Flex>
				<Flex className={classes.commentInfo} vertical>
					<Flex className={classes.info}>
						<Flex className={classes.infoText}>
							<span>{name}</span>
							<span>{dmy}</span>
						</Flex>
						<Flex className={classes.commentAction}>
							<Dropdown menu={{ items: commentMenus }} trigger={['click']}>
								<IconDots />
							</Dropdown>
						</Flex>
					</Flex>
					<Flex className={classes.content}>{content}</Flex>
				</Flex>
			</Flex>
		)
	}
	return (
		<div className={classes.wrapper}>
			<Flex className={classes.container} vertical>
				<Flex className={classes.note}>
					<span className={classes.title}>Comments</span>
					<Flex className={classes.number}>{total}</Flex>
				</Flex>
				{_renderSendCommentBox()}
				<div className={classes.hr} />
				<Flex className={classes.commentWrapper} vertical ref={_parentRef}>
					<Flex
						ref={_childRef}
						vertical
						className={classes.commentList}
						onScroll={onScroll}
					>
						{commentList.map((item) => _renderItemComment(item))}
						{loading &&
							arrayFrom(3).map((_, index) => (
								<Flex key={index} className={classes.skeletonWrapper}>
									<Skeleton.Avatar active className={classes.skeletonAva} />

									<Skeleton.Input active className={classes.skeleton} />
								</Flex>
							))}
					</Flex>
				</Flex>
			</Flex>
		</div>
	)
}

export default memo(EventComment)
