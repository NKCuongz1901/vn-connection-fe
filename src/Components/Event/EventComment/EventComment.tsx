import { IconCircleXFilled, IconDots } from '@tabler/icons-react'
import { Dropdown, Flex, Skeleton } from 'antd'
import { ItemType } from 'antd/es/menu/interface'
import clsx from 'clsx'
import { forwardRef } from 'react'

import { arrayFrom, isArray } from '@/ultis/array'
import { getDateInfo } from '@/ultis/date'
import { getUserInfo } from '@/ultis/storage'
import { copyToClipboard } from '@/ultis/string'

import CCommentItem from '@/Components/Comment/CCommentItem'
import CAvatar from '@/Components/Custom/CAvatar'
import CImage from '@/Components/Custom/CImage'
import CTextArea from '@/Components/Custom/CTextArea'
import CUploadMuti from '@/Components/Custom/CUploadMuti'
import useEventComment from '@/hooks/Event/useEventComment'
import SendIcon from '@/svg/Event/SendIcon'
import ImageIcon from '@/svg/ImageIcon'
import classes from './EventComment.module.scss'

import { DEFAULT_FALLBACK } from '@/Variable/common.variable'

const EventComment = ({ id }, ref) => {
	const {
		_parentRef,
		_childRef,
		loading,
		commentList,
		total,
		commentContent,
		deleteLoading,
		fileList,

		setFileList,
		onChangeComment,
		onSendComment,
		onDeletePost,
		onScroll,
		onKeyDown,
		onImportImg,
		onAction,
	} = useEventComment(
		{
			id,
		},
		ref,
	)
	const _renderSendCommentBox = () => {
		return (
			<Flex vertical className={classes.commentBoxWrapper}>
				<Flex className={classes.chooseImgContent}>
					{fileList.map((i) => {
						const { url, type } = i || {}
						const isImg = type === 'IMAGE'
						return (
							<Flex key={i?.url} className={classes.chooseImgItem}>
								<Flex key={i?.url} className={classes.media}>
									{isImg ? (
										<CImage preview={true} src={i?.url} />
									) : (
										<video preload="none" controls poster={DEFAULT_FALLBACK}>
											<source src={url} type="video/mp4" />
										</video>
									)}
								</Flex>
								<Flex
									className={classes.chooseImgCancel}
									onClick={() => {
										setFileList((prev) =>
											prev.filter((prev) => prev.url !== i.url),
										)
									}}
								>
									<IconCircleXFilled />
								</Flex>
							</Flex>
						)
					})}
				</Flex>
				<Flex className={classes.commentBox}>
					<Flex className={classes.chooseImg} vertical>
						<Flex className={classes.upload}>
							<CUploadMuti
								accept="image/*,video/*"
								maxCount={0}
								fileList={fileList.map((i) => i.file)}
								onChange={({ file: _file, fileList: newList }) => {
									onImportImg(newList)
								}}
							>
								<ImageIcon />
							</CUploadMuti>
						</Flex>
					</Flex>
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
							[classes.disabled]:
								!commentContent.trim() && !isArray(fileList, 1),
						})}
						onClick={onSendComment}
					>
						<SendIcon fill="#F0F3F9" />
					</Flex>
				</Flex>
			</Flex>
		)
	}

	const _renderItemComment = (item) => {
		const { id, user, updated_at, user_id, content, medias } = item || {}
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
					<Flex className={classes.medias}>
						{isArray(medias, 1) ? (
							medias.map((item, index) => {
								const { thumbnail, url, type } = item || {}
								const isImg = type === 'IMAGE'
								return (
									<Flex key={index} className={classes.media}>
										{isImg ? (
											<CImage preview src={thumbnail || url} />
										) : (
											<video preload="none" controls poster={DEFAULT_FALLBACK}>
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
						{/* {commentList.map((item) => _renderItemComment(item))} */}
						{commentList.map((item) => (
							<CCommentItem item={item} key={item.id} onAction={onAction} />
						))}
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

export default forwardRef(EventComment)
