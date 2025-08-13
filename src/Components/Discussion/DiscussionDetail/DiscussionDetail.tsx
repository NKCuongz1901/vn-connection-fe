import { IconChevronLeft, IconCircleXFilled } from '@tabler/icons-react'
import { Flex, Skeleton } from 'antd'
import clsx from 'clsx'
import { memo } from 'react'

import { arrayFrom } from '@/ultis/array.ults'

import CommentItem from '@/Components/Comment/CommentItem'
import CButton from '@/Components/Custom/CButton'
import CImage from '@/Components/Custom/CImage'
import CTextArea from '@/Components/Custom/CTextArea'
import CUploadMuti from '@/Components/Custom/CUploadMuti'
import ModalReport from '@/Components/Custom/ModalReport'
import ModalMyFriend from '@/Components/Friend/ModalMyFriend'
import useDiscussionDetail from '@/hooks/Discussion/useDiscussionDetail'
import SendIcon from '@/svg/Event/SendIcon'
import ImageIcon from '@/svg/ImageIcon'
import DiscussionItem from '../DiscussionItem'
import ModalCRUDDiscussion from '../ModalCRUDDiscussion'

import classes from './DiscussionDetail.module.scss'
interface DiscussionDetailProps {
	discussId: string
	topic?: any
	onAction?: any
}
const DiscussionDetail = ({
	discussId,
	topic,
	onAction: onActionProps = () => null,
}: DiscussionDetailProps) => {
	const {
		loadingShare,
		loading,
		shareList,
		discussDetail,
		modal,
		commentList,
		commentContent,
		deleteLoading,
		fileList,
		editList,
		setFileList,
		setModal,
		onShareFriend,
		onCopy,
		onChangeUrl,
		onGetMenus,
		onGetMenusCommentItem,
		onActionCommentItem,
		onAction,
		onScroll,
		onSendComment,
		onKeyDown,
		onChangeComment,
		onImportImg,
	} = useDiscussionDetail({
		discussId,
		onActionProps,
	})

	const _renderMyFriendComp = (data) => {
		const { friend } = data || {}
		const { id } = friend || {}
		return (
			<div className={classes.btnShareFriend}>
				<CButton
					ctype="oranger"
					onClick={() => onShareFriend(id)}
					loading={loadingShare?.[id]}
					disabled={shareList?.[id]}
				>
					Send
				</CButton>
			</div>
		)
	}

	const _renderContent = () => {
		if (loading.discuss) {
			return (
				<Flex className={classes.skeletonWrapper} vertical>
					<Skeleton.Input active className={classes.skeleton} />
				</Flex>
			)
		}
		return (
			<DiscussionItem
				item={discussDetail}
				onGetMenus={onGetMenus}
				onAction={onAction}
			/>
		)
	}
	const _renderSendCommentBox = () => {
		return (
			<Flex vertical className={classes.commentBoxWrapper}>
				<Flex className={classes.chooseImgContent}>
					{fileList.map((i) => (
						<Flex key={i.imageUrl || i?.url} className={classes.chooseImgItem}>
							<CImage preview={true} src={i.imageUrl || i?.url} />
							<Flex
								className={classes.chooseImgCancel}
								onClick={() => {
									setFileList((prev) =>
										prev.filter((prev) => prev.imageUrl !== i.imageUrl),
									)
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
						<SendIcon fill="#F0F3F9" />
					</Flex>
				</Flex>
			</Flex>
		)
	}
	const _renderCommentList = () => {
		return (
			<Flex vertical className={classes.commentListWrapper}>
				<Flex className={classes.commentListContainer} vertical>
					<Flex className={classes.note}>
						<span className={classes.title}>Comments</span>
						<Flex className={classes.number}>
							{discussDetail?.amount_of_comment || 0}
						</Flex>
					</Flex>
					{_renderSendCommentBox()}
					<div className={classes.hr} />
					<Flex className={classes.commentWrapper} vertical>
						<Flex vertical className={classes.commentList}>
							{commentList.map((item) => (
								<CommentItem
									isEdit={editList.includes(item.id)}
									item={item}
									key={item.id}
									onGetMenus={onGetMenusCommentItem}
									onAction={onActionCommentItem}
									isLoading={deleteLoading.includes(item.id)}
								/>
							))}
							{loading.commentList &&
								arrayFrom(3).map((_, index) => (
									<Flex key={index} className={classes.skeletonWrapper}>
										<Skeleton.Avatar active className={classes.skeletonAva} />

										<Skeleton.Input active className={classes.skeleton} />
									</Flex>
								))}
						</Flex>
					</Flex>
				</Flex>
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
			onCopy: () => onCopy(data?.props?.share_link),
		}
		switch (type) {
			case 'share':
				{
					Content = (
						<ModalMyFriend
							title="Share friend"
							{...propsModal}
							customComp={_renderMyFriendComp}
						/>
					)
				}
				break
			case 'report':
				Content = (
					<ModalReport
						open
						{...propsModal}
						data={{ discuss_id: data?.id }}
						title={'Report'}
						message={'You want to report this discussion ?'}
					/>
				)
				break
			case 'reportCommentItem':
				Content = (
					<ModalReport
						open
						{...propsModal}
						data={{ comment_id: data?.id }}
						title={'Report'}
						message={'You want to report this comment ?'}
					/>
				)
				break

			case 'edit':
				Content = (
					<ModalCRUDDiscussion
						{...propsModal}
						onSuccess={(item) => onAction({ key: 'edit', value: item })}
						data={data}
						topic={topic}
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
			<Flex vertical className={classes.container}>
				<Flex
					className={classes.back}
					onClick={() => onChangeUrl({ key: 'back', value: null })}
				>
					<IconChevronLeft />
					<div className={classes.title}>Discussion</div>
				</Flex>
				<Flex vertical className={classes.body} onScroll={onScroll}>
					{_renderContent()}
					{_renderCommentList()}
				</Flex>
			</Flex>
			{_renderModal()}
		</div>
	)
}

export default memo(DiscussionDetail)
