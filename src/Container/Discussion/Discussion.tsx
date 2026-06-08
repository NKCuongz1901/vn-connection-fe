'use client'
import { IconChevronRight } from '@tabler/icons-react'
import { Flex, Skeleton } from 'antd'
import clsx from 'clsx'
import { memo, useCallback, useMemo } from 'react'

import { arrayFrom, isArray } from '@/ultis/array'
import { toJson } from '@/ultis/common'
import { parseNumberToShort } from '@/ultis/string'

import CAvatar from '@/Components/Custom/CAvatar'
import CButton from '@/Components/Custom/CButton'
import CImage from '@/Components/Custom/CImage'
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
import ImageIcon from '@/svg/ImageIcon'
import SearchIcon from '@/svg/SearchIcon'

import classes from './Discussion.module.scss'
import { REPORT_ISSUE_TYPE } from '@/Variable/common.variable'

const mappingTopicTitle = {
	explore: 'Channels Suggestions',
	join: 'My Channels',
}

const filterCategoryByTopic = (categories: any[] = [], search = '') => {
	const keyword = search.toLocaleLowerCase()
	return categories.filter((item) =>
		item?.title?.toLocaleLowerCase()?.includes(keyword),
	)
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
		category_id,
		setTitleTopic,
		setTitle,
		onJoinCategory,
		onUnJoinCategory,
		onGetMenus,
		onCopy,
		onShareFriend,
		onScroll,
		onAction,
		onChangeUrl,
		onGetMyCategory,
		onGeRecommendCategory,
	} = useDiscussion({})

	const filteredMyCategory = useMemo(
		() => filterCategoryByTopic(myCategory, titleTopic),
		[myCategory, titleTopic],
	)
	const filteredRecommendCategory = useMemo(
		() => filterCategoryByTopic(recommendCategory, titleTopic),
		[recommendCategory, titleTopic],
	)
	const myCategoryCount = myCategory?.length ?? 0
	const recommendCategoryCount = recommendCategory?.length ?? 0

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
	const _renderCurrentTopic = useCallback(() => {
		if (!category_id) return
		const currentCategory = [...myCategory, ...recommendCategory].find(
			(i) => i.id === category_id,
		)
		const { image, title, amount_of_user, is_liked, id } = currentCategory || {}
		return (
			<Flex className={classes.currentCategory}>
				<Flex className={classes.image}>
					<CImage src={image} />
				</Flex>
				<Flex vertical className={classes.currentCategoryInfo}>
					<div className={classes.title}>{title}</div>
					<div className={classes.number}>
						{parseNumberToShort(amount_of_user)} members
					</div>
				</Flex>
				<Flex className={classes.btn}>
					<CButton
						ctype={is_liked ? 'disabled' : 'oranger'}
						onClick={() => {
							if (is_liked) {
								onUnJoinCategory(id)
							} else {
								onJoinCategory(id)
							}
						}}
					>
						{is_liked ? 'Joined' : 'Join'}
					</CButton>
				</Flex>
			</Flex>
		)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [category_id, toJson({ myCategory, recommendCategory, classes })])
	const _renderAddNew = () => {
		if (discussId) return
		return (
			<Flex className={classes.addNew} vertical>
				{_renderCurrentTopic()}
				<Flex
					className={classes.addNewBody}
					onClick={() =>
						setModal({
							type: 'addNew',
							data: category_id ? { category: { id: category_id } } : null,
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
			<Flex vertical className={classes.left} onScroll={onScroll}>
				<div className={classes.addNewLeft}>{_renderAddNew()}</div>
				<Flex className={classes.searchBar}>
					<CInput
						onChange={(e) => setTitle(e.target.value)}
						value={title}
						prefix={<SearchIcon />}
						placeholder="Search"
						style={{ borderRadius: 40, height: 40 }}
					/>
				</Flex>
				<Flex className={classes.leftContent} vertical>
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
	const _renderJoin = (vertical = false) => {
		return (
			<Flex
				vertical
				className={clsx(classes.topic, { [classes.join]: vertical })}
			>
				<Flex
					className={classes.titleTopic}
					onClick={() => setModal({ type: 'topic', data: 'join' })}
				>
					<div className={classes.title}>
						{mappingTopicTitle.join}
						<span className={classes.titleCount}>({myCategoryCount})</span>
					</div>
					<div className={classes.arrowIcon}>
						<IconChevronRight />
					</div>
				</Flex>
				<Flex className={classes.topicList} vertical>
					{filteredMyCategory.map((item) => (
						<div
							key={item.id}
							onClick={() => {
								onChangeUrl({ key: 'category_id', value: item })
							}}
							className={classes.categoryItem}
						>
							<CategoryItem item={item} hiddenJoin />
						</div>
					))}
				</Flex>
			</Flex>
		)
	}
	const _renderSuggestion = (vertical = false) => {
		if (recommendCategoryCount === 0) return null

		return (
			<Flex
				vertical
				className={clsx(classes.topic, { [classes.suggest]: vertical })}
			>
				<Flex
					className={classes.titleTopic}
					onClick={() => setModal({ type: 'topic', data: 'explore' })}
				>
					<div className={classes.title}>
						{mappingTopicTitle.explore}
						<span className={classes.titleCount}>
							({recommendCategoryCount})
						</span>
					</div>
					<div className={classes.arrowIcon}>
						<IconChevronRight />
					</div>
				</Flex>
				<Flex className={classes.topicList} vertical>
					{filteredRecommendCategory.map((item) => (
						<div
							className={classes.categoryItem}
							key={item.id}
							onClick={() => {
								onChangeUrl({ key: 'category_id', value: item })
							}}
						>
							<CategoryItem
								loading={loadingJoin}
								item={item}
								onJoinCategory={onJoinCategory}
							/>
						</div>
					))}
				</Flex>
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
					{_renderJoin(true)}
					{_renderSuggestion(true)}
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
						reportType={REPORT_ISSUE_TYPE.TALKROOM}
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
						data={data}
						topic={
							category_id ? [...myCategory, ...recommendCategory] : myCategory
						}
					/>
				)
				break
			case 'edit':
				Content = (
					<ModalCRUDDiscussion
						{...propsModal}
						onSuccess={(item) => onAction({ key: 'edit', value: item })}
						topic={[...myCategory, ...recommendCategory]}
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
				<div className={classes.addNewTop}>{_renderAddNew()}</div>
				{_renderTop()}
				{_renderLeft()}
				{_renderRight()}
			</Flex>
			{_renderModal()}
		</div>
	)
}

export default memo(Discussion)
