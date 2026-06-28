import { IconChevronLeft } from '@tabler/icons-react'
import { Flex, Skeleton } from 'antd'
import clsx from 'clsx'
import { forwardRef } from 'react'

import useDiscussionDetail from '@/hooks/Discussion/useDiscussionDetail'

import CButton from '@/Components/Custom/CButton'
import ModalReport from '@/Components/Custom/ModalReport'
import EventComment from '@/Components/Event/EventComment'
import ModalMyFriend from '@/Components/Friend/ModalMyFriend'
import DiscussionItem from '../DiscussionItem'
import ModalCRUDDiscussion from '../ModalCRUDDiscussion'

import { mainRoutes } from '@/routes/MainRoutes'
import { useSafeBack } from '@/ultis/route'

import classes from './DiscussionDetail.module.scss'
import { REPORT_ISSUE_TYPE } from '@/Variable/common.variable'
interface DiscussionDetailProps {
	discussId: string
	conversation_id?: string
	topic?: any
	onAction?: any
	title?: string
	isPublic?: boolean
	onRequireLogin?: () => void
}
const DiscussionDetail = (
	{
		discussId,
		topic,
		conversation_id,
		onAction: onActionProps = () => null,
		title,
		isPublic,
		onRequireLogin,
	}: DiscussionDetailProps,
	ref,
) => {
	const { goBackOrPush } = useSafeBack()
	const {
		eventCommentRef,

		loadingShare,
		loading,
		shareList,
		discussDetail,
		modal,

		setModal,
		onShareFriend,
		onCopy,
		onChangeUrl,
		onGetMenus,
		onAction,
		onScroll,
	} = useDiscussionDetail(
		{
			discussId,
			onActionProps,
			conversation_id,
			isPublic,
			onRequireLogin,
		},
		ref,
	)

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
				isPublic={isPublic}
				isDetailView={isPublic}
				onRequireLogin={onRequireLogin}
			/>
		)
	}

	const _renderModal = () => {
		const { type, data } = modal || {}
		let Content = <></>
		const propsModal = {
			conversation_id: conversation_id,
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
						reportType={REPORT_ISSUE_TYPE.TALKROOM}
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
						reportType={REPORT_ISSUE_TYPE.TALKROOM}
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
	const handleBack = () => {
		if (isPublic) {
			goBackOrPush(mainRoutes.login)
			return
		}
		onChangeUrl({ key: 'back', value: null })
	}

	return (
		<div
			className={clsx(classes.wrapper, {
				[classes.wrapperPublic]: isPublic,
			})}
		>
			<Flex vertical className={classes.container}>
				<Flex className={classes.back} onClick={handleBack}>
					<IconChevronLeft />
					<div className={classes.title}>{title || 'Discussion'}</div>
				</Flex>
				<Flex
					vertical
					className={clsx(classes.body, {
						[classes.noScroll]: !!conversation_id,
					})}
					onScroll={onScroll}
				>
					<div className={classes.postCard}>{_renderContent()}</div>
					<Flex
						className={clsx(classes.comment, {
							[classes.commentCard]: isPublic,
						})}
					>
						<EventComment
							id={discussId}
							ref={eventCommentRef}
							isPublic={isPublic}
							onRequireLogin={onRequireLogin}
						/>
					</Flex>
				</Flex>
			</Flex>
			{!isPublic && _renderModal()}
		</div>
	)
}

export default forwardRef(DiscussionDetail)
