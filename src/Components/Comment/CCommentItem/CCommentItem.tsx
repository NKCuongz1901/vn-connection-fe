import { IconCircleXFilled, IconDots } from '@tabler/icons-react'
import { Dropdown, Flex, Skeleton } from 'antd'
import { ItemType } from 'antd/es/menu/interface'
import clsx from 'clsx'
import { memo } from 'react'

import useCCommentItem from '@/hooks/Comment/CommentItem/useCCommentItem'

import { arrayFrom, isArray } from '@/ultis/array'
import { getDiffFromNow } from '@/ultis/date'

import CAvatar from '@/Components/Custom/CAvatar'
import CButton from '@/Components/Custom/CButton'
import CImage from '@/Components/Custom/CImage'
import CTextArea from '@/Components/Custom/CTextArea'
import CUploadMuti from '@/Components/Custom/CUploadMuti'
import ModalReport from '@/Components/Custom/ModalReport'
import Heart from '@/svg/Heart'
import ImageIcon from '@/svg/ImageIcon'
import MessageMinuIcon from '@/svg/MessageMinuIcon'
import classes from './CCommentItem.module.scss'

import { DEFAULT_FALLBACK } from '@/Variable/common.variable'
import CTextSpecial from '@/Components/Custom/CTextSpecial'

interface CommentItemProps {
	isEdit?: boolean
	item: any
	onAction?: any
	isLoading?: boolean
}

const CCommentItem = (props: CommentItemProps) => {
	const { item, isLoading = false } = props
	const {
		_loadmore,

		editChild,
		isReply,
		isEdit,
		loadingSubmit,
		loading,
		hiddenReply,

		commentList,
		modal,
		deleteLoading,
		setModal,

		dataSubmit,
		contentDataSubmit,

		fileList,
		setFileList,
		onGetMenus,
		onGetMenusItem,
		onAction: onActionItem,
		onChangeDataSubmit,
		onImportImg,
		onCommentItemParentAction,
		onLoadMore,
		onSetHiddenReply,
	} = useCCommentItem(props)
	const {
		id,
		user,
		created_at,
		content,
		mentions,
		is_liked,
		amount_of_like,
		amount_of_replies,
		medias,
	} = dataSubmit || {}

	const { avatar, name } = user || {}
	const { value: timeAgo, unit } = getDiffFromNow({ input: created_at })
	const commentMenus: ItemType[] = onGetMenusItem(item)
	const _renderCommentChild = (item) => {
		const {
			id,
			user,
			created_at,
			content,
			is_liked,
			amount_of_like,
			medias,
			mentions,
		} = item || {}
		const { value: timeAgo, unit } = getDiffFromNow({ input: created_at })

		const { avatar, name } = user || {}
		const itemMenus = onGetMenus(item)
		const isEdit = id === editChild
		return (
			<Flex
				className={clsx(classes.commentItem, {
					[classes.loading]: isLoading || deleteLoading[id],
				})}
			>
				<Flex className={classes.avatar}>
					<CAvatar src={avatar} />
				</Flex>
				{isEdit ? (
					_renderSendCommentBox({
						disabled: loadingSubmit.editChild,
						onCancel: ({ value }: any) =>
							onActionItem({ key: 'cancelEdit', value: value }),
						onSubmit: () =>
							onActionItem({ key: 'submitEdit', value: contentDataSubmit?.id }),
					})
				) : (
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
							<Flex className={classes.content}>
								<CTextSpecial data={content} mentions={mentions} />
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
						<Flex className={classes.footer}>
							<Flex
								className={classes.footerIcon}
								onClick={(e) => {
									e.stopPropagation()
									onActionItem({ key: 'like', value: id })
								}}
							>
								<Heart fill={is_liked ? '#F80024' : '#94A3B8'} />{' '}
								{amount_of_like}
							</Flex>
							<div className={classes.vertical} />
							<Flex
								className={classes.footerIcon}
								onClick={() => onActionItem({ key: 'reply', value: item })}
							>
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
				)}
			</Flex>
		)
	}
	const _renderCommentChildren = () => {
		return (
			<Flex vertical className={classes.wrapperChildren}>
				{hiddenReply ? (
					<div
						className={clsx(classes.loadmore, {
							[classes.hidden]: !isArray(commentList, 1),
						})}
						onClick={() => onSetHiddenReply(false)}
					>
						Show replies ({amount_of_replies})
					</div>
				) : (
					<>
						{(commentList || []).map((item) => _renderCommentChild(item))}

						{loading.commentList &&
							arrayFrom(3).map((_, index) => (
								<Flex
									key={index}
									className={clsx(classes.skeletonWrapper, classes.commentItem)}
								>
									<Skeleton.Input active className={classes.skeleton} />
								</Flex>
							))}
						<div
							className={clsx(classes.loadmore, {
								[classes.hidden]: !isArray(commentList, 1),
							})}
							onClick={() => onSetHiddenReply(true)}
						>
							Hide replies
						</div>
						{!loading.commentList && !!_loadmore.current && (
							<>
								<div className={classes.loadmore} onClick={onLoadMore}>
									Show more replies
								</div>
							</>
						)}
					</>
				)}

				{isReply &&
					_renderSendCommentBox({
						disabled: loadingSubmit.reply,
						textSubmit: 'Send',
						onCancel: ({ value }: any) =>
							onActionItem({ key: 'cancelEdit', value: value }),
						onSubmit: ({ value }: any) =>
							onActionItem({ key: 'submitReply', value: value }),
					})}
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
	const _renderSendCommentBox = (params: {
		disabled?: boolean
		textCancel?: string
		textSubmit?: string
		onCancel: any
		onSubmit: any
	}) => {
		const {
			disabled,
			textCancel,
			textSubmit,
			onCancel = () => null,
			onSubmit = () => null,
		} = params || {}
		return (
			<Flex
				vertical
				className={clsx(classes.commentBoxWrapper, {
					[classes.disabled]: !!disabled,
				})}
			>
				<Flex className={classes.chooseImgContent}>
					{[...(contentDataSubmit.medias || []), ...fileList].map((i) => {
						const { type, url } = i || {}
						const isImg = type === 'IMAGE'
						return (
							<Flex
								key={i.imageUrl || i?.url}
								className={classes.chooseImgItem}
							>
								{isImg ? (
									<CImage preview={true} src={i.imageUrl || i?.url} />
								) : (
									<video controls>
										<source src={url} type="video/mp4" />
									</video>
								)}
								<Flex
									className={classes.chooseImgCancel}
									onClick={() => {
										setFileList((prev) => {
											return prev.filter((prev) => prev.url !== i.url)
										})
										onChangeDataSubmit('removeImg')(i)
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
						disabled={!!disabled}
						allowClear
						placeholder="What's on my mind ?"
						autoSize={{ minRows: 3, maxRows: 3 }}
						value={contentDataSubmit.content}
						onChange={onChangeDataSubmit('content')}
					/>
				</Flex>
				<Flex className={clsx(classes.bntComment)}>
					<CButton
						ctype="disabled"
						onClick={() => onCancel({ key: 'cancelEdit', value: id })}
						disabled={!!disabled}
					>
						{textCancel || 'Cancel'}
					</CButton>
					<CButton
						loading={!!disabled}
						ctype="oranger"
						disabled={
							!!disabled ||
							(!contentDataSubmit?.content?.trim() &&
								!isArray([...(contentDataSubmit.medias || []), ...fileList], 1))
						}
						onClick={() => onSubmit({ key: 'submitEdit', value: id })}
					>
						{textSubmit || 'Update'}
					</CButton>
				</Flex>
			</Flex>
		)
	}
	return (
		<div className={classes.wrapper}>
			<Flex
				className={clsx(classes.commentItem, { [classes.loading]: isLoading })}
			>
				<Flex className={classes.avatar}>
					<CAvatar src={avatar} />
				</Flex>
				{isEdit ? (
					_renderSendCommentBox({
						disabled: loadingSubmit.edit,
						onCancel: onCommentItemParentAction,
						onSubmit: onCommentItemParentAction,
					})
				) : (
					<Flex className={classes.right} vertical>
						<Flex
							className={clsx(classes.commentInfo, {
								[classes.commentInfoOpacity]: loadingSubmit.delete,
							})}
							vertical
						>
							<Flex className={classes.info}>
								<Flex className={classes.infoText}>
									<span>{name}</span>
									<span>
										{timeAgo} {unit ? unit + 's ago' : ''}
									</span>
								</Flex>
							</Flex>
							<Flex className={classes.content}>
								<CTextSpecial data={content} mentions={mentions} />
							</Flex>
							<Flex className={classes.medias}>
								{isArray(medias, 1) ? (
									medias.map((item) => {
										const { thumbnail, url, type } = item || {}
										const isImg = type === 'IMAGE'
										return (
											<Flex key={thumbnail || url} className={classes.media}>
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
						<Flex className={classes.footer}>
							<Flex
								className={classes.footerIcon}
								onClick={(e) => {
									e.stopPropagation()
									onCommentItemParentAction({ key: 'like', value: id })
								}}
							>
								<Heart fill={is_liked ? '#F80024' : '#94A3B8'} />{' '}
								{amount_of_like}
							</Flex>
							<div className={classes.vertical} />
							<Flex
								className={classes.footerIcon}
								onClick={() =>
									onActionItem({ key: 'reply', value: dataSubmit })
								}
							>
								<MessageMinuIcon /> {amount_of_replies}
							</Flex>
							<div className={classes.vertical} />
							<Flex className={classes.footerIcon}>
								<Dropdown menu={{ items: commentMenus }} trigger={['click']}>
									<IconDots />
								</Dropdown>
							</Flex>
						</Flex>
						{_renderCommentChildren()}
					</Flex>
				)}
			</Flex>
			{_renderModal()}
		</div>
	)
}

export default memo(CCommentItem)
