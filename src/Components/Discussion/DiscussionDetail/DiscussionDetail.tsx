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

import classes from './DiscussionDetail.module.scss'
interface DiscussionDetailProps {
	discussId: string
	conversation_id?: string
	topic?: any
	onAction?: any
	title?: string
}
const DiscussionDetail = (
	{
		discussId,
		topic,
		conversation_id,
		onAction: onActionProps = () => null,
		title,
	}: DiscussionDetailProps,
	ref,
) => {
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
					<div className={classes.title}>{title || 'Discussion'}</div>
				</Flex>
				<Flex
					vertical
					className={clsx(classes.body, {
						[classes.noScroll]: !!conversation_id,
					})}
					onScroll={onScroll}
				>
					{_renderContent()}
					<Flex className={classes.comment}>
						<EventComment id={discussId} ref={eventCommentRef} />
					</Flex>
				</Flex>
			</Flex>
			{_renderModal()}
		</div>
	)
}

export default forwardRef(DiscussionDetail)
