import { Flex, Skeleton } from 'antd'
import clsx from 'clsx'
import { forwardRef } from 'react'

import useDetailCommunityDiscussion from '@/hooks/Community/useDetailCommunityDiscussion'

import { arrayFrom, isArray } from '@/ultis/array.ults'

import CAvatar from '@/Components/Custom/CAvatar'
import CButton from '@/Components/Custom/CButton'
import ModalReport from '@/Components/Custom/ModalReport'
import DiscussionDetail from '@/Components/Discussion/DiscussionDetail'
import DiscussionItem from '@/Components/Discussion/DiscussionItem'
import ModalCRUDDiscussion from '@/Components/Discussion/ModalCRUDDiscussion'
import ModalMyFriend from '@/Components/Friend/ModalMyFriend'
import NoPostIcon from '@/svg/DiscusstionSvg/NoPostIcon'
import ImageIcon from '@/svg/ImageIcon'

import classes from './DetailCommunityDiscussion.module.scss'
interface DetailCommunityDiscussionProp {
	id: string
	[key: string]: any
}
const DetailCommunityDiscussion = (
	props: DetailCommunityDiscussionProp,
	ref,
) => {
	const { id } = props
	const {
		loadingShare,
		shareList,
		loading,
		discuss,

		modal,
		setModal,
		discussId,
		totalDiscuss,

		setShareList,
		onGetMenus,
		onCopy,
		onShareFriend,
		onScroll,
		onAction,
		onChangeUrl,
	} = useDetailCommunityDiscussion(props, ref)

	const _renderTop = () => {
		return (
			<Flex className={classes.renderTop}>
				<div className={classes.renderTopLabel}>Topic</div>
				<div className={classes.renderTopCount}>{totalDiscuss}</div>
			</Flex>
		)
	}
	const _renderNoPost = () => {
		if (loading.discuss) return <></>
		return (
			<Flex vertical className={classes.wrapperNoPost}>
				<NoPostIcon />
				<div className={classes.titleNoPost}>No posts yet</div>
				<div className={classes.textNoPost}>Follow community to see posts</div>
			</Flex>
		)
	}
	const _renderSkeleton = () => {
		return (
			<Flex className={classes.skeletonWrapper} vertical>
				{arrayFrom(3).map((_, index) => (
					<Skeleton.Input key={index} active className={classes.skeleton} />
				))}
			</Flex>
		)
	}
	const _renderAddNew = () => {
		if (discussId) return
		return (
			<Flex className={classes.addNew} vertical>
				<Flex
					className={classes.addNewBody}
					onClick={() =>
						setModal({
							type: 'addNew',
							data: null,
						})
					}
				>
					<div>
						<CAvatar />
					</div>
					<Flex className={classes.addNewInput}>What's on your mind?</Flex>
					<ImageIcon />
				</Flex>
			</Flex>
		)
	}
	const _renderLeft = () => {
		if (discussId) {
			return (
				<Flex vertical className={classes.content}>
					<DiscussionDetail
						conversation_id={id}
						discussId={discussId}
						ref={ref}
						onAction={onAction}
						title="Topic"
					/>
				</Flex>
			)
		}
		return (
			<Flex vertical className={classes.content}>
				{_renderAddNew()}
				<Flex vertical>
					{_renderTop()}
					<Flex className={classes.mainContent} vertical>
						{isArray(discuss, 1)
							? discuss.map((item) => (
									<DiscussionItem
										noRadius
										key={item.id}
										item={item}
										onGetMenus={onGetMenus}
										onAction={onAction}
										onChangeUrl={onChangeUrl}
									/>
							  ))
							: _renderNoPost()}
						{loading.discuss && _renderSkeleton()}
					</Flex>
				</Flex>
			</Flex>
		)
	}

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
	const _renderModal = () => {
		const { type, data } = modal || {}
		let Content = <></>
		const propsModal = {
			conversation_id: id,
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
							onClose={() => {
								setModal({})
								setShareList({})
							}}
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
			case 'addNew':
				Content = (
					<ModalCRUDDiscussion
						{...propsModal}
						onSuccess={(item) => onAction({ key: 'addNew', value: item })}
						data={data}
					/>
				)
				break
			case 'edit':
				Content = (
					<ModalCRUDDiscussion
						{...propsModal}
						onSuccess={(item) => onAction({ key: 'edit', value: item })}
						data={data}
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
				className={clsx(classes.container, {
					[classes.containerHidden]: discussId,
				})}
				onScroll={onScroll}
			>
				{_renderLeft()}
				{_renderModal()}
			</Flex>
		</div>
	)
}

export default forwardRef(DetailCommunityDiscussion)
