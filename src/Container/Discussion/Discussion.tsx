'use client'
import { IconChevronRight } from '@tabler/icons-react'
import { Flex, Skeleton } from 'antd'
import clsx from 'clsx'
import { memo } from 'react'

import { arrayFrom, isArray } from '@/ultis/array.ults'

import CButton from '@/Components/Custom/CButton'
import CInput from '@/Components/Custom/CInput'
import ModalReport from '@/Components/Custom/ModalReport'
import CategoryItem from '@/Components/Discussion/CategoryItem'
import DiscussionDetail from '@/Components/Discussion/DiscussionDetail'
import DiscussionItem from '@/Components/Discussion/DiscussionItem'
import ModalCRUDDiscussion from '@/Components/Discussion/ModalCRUDDiscussion'
import ModalTopic from '@/Components/Discussion/ModalTopic'
import ModalMyFriend from '@/Components/Friend/ModalMyFriend'
import useDiscussion from '@/hooks/Discussion/useDiscussion'
import NoPostIcon from '@/svg/DiscusstionSvg/NoPostIcon'
import SearchIcon from '@/svg/SearchIcon'

import classes from './Discussion.module.scss'

const mappingTopicTitle = {
	explore: 'Channels Suggestions',
	join: 'My Channels',
}
const Discussion = () => {
	const {
		loadingShare,
		shareList,
		loadingJoin,
		loading,
		discuss,
		myCategory,
		recommendCategory,
		modal,
		setModal,
		title,
		discussId,
		titleTopic,
		setTitleTopic,
		setTitle,
		onJoinCategory,
		onGetMenus,
		onCopy,
		onShareFriend,
		onScroll,
		onAction,
		onChangeUrl,
		onGetMyCategory,
		onGeRecommendCategory,
	} = useDiscussion({})
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
	const _renderLeft = () => {
		if (discussId) {
			return (
				<Flex vertical className={classes.left}>
					<DiscussionDetail
						discussId={discussId}
						topic={myCategory}
						onAction={onAction}
					/>
				</Flex>
			)
		}
		return (
			<Flex vertical className={classes.left}>
				<Flex className={classes.searchBar}>
					<CInput
						onChange={(e) => setTitle(e.target.value)}
						value={title}
						prefix={<SearchIcon />}
						placeholder="Search"
						style={{ borderRadius: 40, height: 40 }}
					/>
				</Flex>
				<Flex className={classes.leftContent} vertical onScroll={onScroll}>
					{isArray(discuss, 1)
						? discuss.map((item) => (
								<DiscussionItem
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
		)
	}
	const _renderJoin = () => {
		return (
			<Flex vertical className={classes.topic}>
				<Flex
					className={classes.titleTopic}
					onClick={() => setModal({ type: 'topic', data: 'join' })}
				>
					<div className={classes.title}>{mappingTopicTitle.join}</div>
					<div className={classes.arrowIcon}>
						<IconChevronRight />
					</div>
				</Flex>
				<Flex className={classes.topicList} vertical>
					{(myCategory || []).map(
						(item) =>
							item?.title
								?.toLocaleLowerCase()
								?.includes(titleTopic.toLocaleLowerCase()) && (
								<div
									key={item.id}
									onClick={() => {
										onChangeUrl({ key: 'category_id', value: item })
									}}
									className={classes.categoryItem}
								>
									<CategoryItem item={item} hiddenJoin />
								</div>
							),
					)}
				</Flex>
			</Flex>
		)
	}
	const _renderSuggestion = () => {
		return (
			<Flex vertical className={classes.topic}>
				<Flex
					className={classes.titleTopic}
					onClick={() => setModal({ type: 'topic', data: 'explore' })}
				>
					<div className={classes.title}>{mappingTopicTitle.explore}</div>
					<div className={classes.arrowIcon}>
						<IconChevronRight />
					</div>
				</Flex>
				<Flex className={classes.topicList} vertical>
					{(recommendCategory || []).map(
						(item) =>
							item?.title
								?.toLocaleLowerCase()
								?.includes(titleTopic.toLocaleLowerCase()) && (
								<div
									className={classes.categoryItem}
									key={item.id}
									onClick={() => {
										onChangeUrl({ key: 'category_id', value: item })
									}}
								>
									<CategoryItem
										key={item.id}
										loading={loadingJoin}
										item={item}
										onJoinCategory={onJoinCategory}
									/>
								</div>
							),
					)}
				</Flex>
			</Flex>
		)
	}
	const _renderAddNew = () => {
		if (discussId) return
		return (
			<Flex
				className={classes.addNew}
				onClick={() => setModal({ type: 'addNew', data: null })}
			>
				<div className={classes.addNewIcon}>+</div>
			</Flex>
		)
	}
	const _renderRight = () => {
		return (
			<Flex vertical className={classes.right}>
				<Flex className={classes.searchBar}>
					<CInput
						value={titleTopic}
						prefix={<SearchIcon />}
						placeholder="Search"
						style={{ borderRadius: 40, height: 40 }}
						onChange={(e) => setTitleTopic(e.target.value)}
					/>
				</Flex>
				<Flex vertical className={classes.category}>
					{_renderJoin()}
					{_renderSuggestion()}
				</Flex>
			</Flex>
		)
	}
	const _renderTop = () => {
		if (discussId) return
		return (
			<Flex vertical className={clsx(classes.right, classes.top)}>
				<Flex className={classes.searchBar}>
					<CInput
						value={titleTopic}
						prefix={<SearchIcon />}
						placeholder="Search"
						style={{ borderRadius: 40, height: 40 }}
						onChange={(e) => setTitleTopic(e.target.value)}
					/>
				</Flex>
				<Flex vertical className={classes.category}>
					{_renderJoin()}
					{_renderSuggestion()}
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
		console.log('🏖️🏖️🏖️ TrieuNinhHan ~ :248 ~ _renderModal ~ data:', data)
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
			case 'topic':
				Content = (
					<ModalTopic
						title={mappingTopicTitle[data] || mappingTopicTitle.join}
						{...propsModal}
						type={data}
						onClose={() => {
							onGetMyCategory()
							onGeRecommendCategory()
							setModal({})
						}}
					/>
				)
				break
			case 'addNew':
				Content = (
					<ModalCRUDDiscussion
						{...propsModal}
						onSuccess={(item) => onAction({ key: 'addNew', value: item })}
						topic={myCategory}
					/>
				)
				break
			case 'edit':
				Content = (
					<ModalCRUDDiscussion
						{...propsModal}
						onSuccess={(item) => onAction({ key: 'edit', value: item })}
						topic={myCategory}
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
				{_renderTop()}
				{_renderLeft()}
				{_renderRight()}
				{_renderAddNew()}
			</Flex>
			{_renderModal()}
		</div>
	)
}

export default memo(Discussion)
