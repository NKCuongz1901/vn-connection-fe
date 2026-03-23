import { IconCircleXFilled, IconDots } from '@tabler/icons-react'
import { Dropdown, Flex } from 'antd'
import { ItemType } from 'antd/es/menu/interface'
import clsx from 'clsx'
import { memo } from 'react'

import useCommentItem from '@/hooks/Comment/CommentItem/useCommentItem'

import { isArray } from '@/ultis/array'
import { getDiffFromNow } from '@/ultis/date'

import CAvatar from '@/Components/Custom/CAvatar'
import CButton from '@/Components/Custom/CButton'
import CImage from '@/Components/Custom/CImage'
import CTextArea from '@/Components/Custom/CTextArea'
import CUploadMuti from '@/Components/Custom/CUploadMuti'
import ModalReport from '@/Components/Custom/ModalReport'
import { useLoading } from '@/context/LoadingContext'
import Heart from '@/svg/Heart'
import ImageIcon from '@/svg/ImageIcon'
import MessageMinuIcon from '@/svg/MessageMinuIcon'

import classes from './CommentItem.module.scss'

interface CommentItemProps {
	isEdit?: boolean
	item: any
	onGetMenus: any
	onAction?: any
	isLoading?: boolean
}

const CommentItem = ({
	isEdit,
	item,
	onGetMenus = () => null,
	onAction = () => null,
	isLoading = false,
}: CommentItemProps) => {
	const { loadingContext } = useLoading()
	const {
		commentList,
		modal,
		deleteLoading,
		setModal,
		dataSubmit,
		fileList,
		setFileList,
		onGetMenus: onGetMenusItem,
		onAction: onActionItem,
		onChangeDataSubmit,
		onImportImg,
		onEditComment,
	} = useCommentItem({ item, onAction })
	const {
		id,
		user,
		created_at,
		content,
		is_liked,
		amount_of_like,
		amount_of_replies,
		medias,
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
	const _renderSendCommentBox = () => {
		return (
			<Flex vertical className={classes.commentBoxWrapper}>
				<Flex className={classes.chooseImgContent}>
					{[...(dataSubmit.medias || []), ...fileList].map((i) => (
						<Flex key={i.imageUrl || i?.url} className={classes.chooseImgItem}>
							<CImage preview={true} src={i.imageUrl || i?.url} />
							<Flex
								className={classes.chooseImgCancel}
								onClick={() => {
									setFileList((prev) =>
										prev.filter((prev) => prev.imageUrl !== i.imageUrl),
									)
									onChangeDataSubmit('removeImg')(i)
								}}
							>
								<IconCircleXFilled />
							</Flex>
						</Flex>
					))}
				</Flex>
				<Flex className={classes.commentBox}>
					<Flex className={classes.chooseImg} vertical>
						<Flex className={classes.upload}>
							<CUploadMuti
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
						allowClear
						placeholder="What's on my mind ?"
						autoSize={{ minRows: 3, maxRows: 3 }}
						value={dataSubmit.content}
						onChange={onChangeDataSubmit('content')}
					/>
				</Flex>
				<Flex className={clsx(classes.bntComment)}>
					<CButton
						ctype="disabled"
						onClick={() => onAction({ key: 'cancelEdit', value: id })}
						disabled={loadingContext}
					>
						Cancel
					</CButton>
					<CButton
						ctype="oranger"
						disabled={loadingContext || !dataSubmit?.content?.trim()}
						onClick={onEditComment}
					>
						Update
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
					_renderSendCommentBox()
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
							<Flex className={classes.content}>{content}</Flex>
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
						<Flex className={classes.footer}>
							<Flex
								className={classes.footerIcon}
								onClick={(e) => {
									e.stopPropagation()
									onAction({ key: 'like', value: id })
								}}
							>
								<Heart fill={is_liked ? '#F80024' : '#94A3B8'} />{' '}
								{amount_of_like}
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
				)}
			</Flex>
			{_renderModal()}
		</div>
	)
}

export default memo(CommentItem)
