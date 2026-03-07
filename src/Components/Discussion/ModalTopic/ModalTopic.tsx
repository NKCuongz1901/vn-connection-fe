import { Flex, Skeleton } from 'antd'
import { memo } from 'react'

import useDiscussionTopic from '@/hooks/Discussion/useDiscussionTopic'

import { arrayFrom, isArray } from '@/ultis/array'

import CInput from '@/Components/Custom/CInput'
import CModal from '@/Components/Custom/CModal/CModal'
import SearchIcon from '@/svg/SearchIcon'
import CategoryItem from '../CategoryItem'

import classes from './ModalTopic.module.scss'

interface ModalTopicProps {
	title: string
	onClose: any
	type: string
	customComp?: any
	desc?: {
		label?: string
		icon?: any
	}
	onCopy?: any
}

const ModalTopic = (_props: ModalTopicProps) => {
	const { onClose, title, type } = _props
	const { category, loading, titleTopic, setTitleTopic, onJoinCategory } =
		useDiscussionTopic({ type })
	const _renderTopic = (topic) => {
		const { id, title, children } = topic || {}
		if (!isArray(children, 1)) return <></>
		return (
			<Flex key={id} className={classes.topic} vertical>
				<div className={classes.title}>{title}</div>
				<Flex className={classes.topicChildrenWrapper}>
					{children.map((child) => (
						<div key={child.id} className={classes.topicChildren}>
							<CategoryItem
								item={child}
								onJoinCategory={(_id) =>
									onJoinCategory({ id: _id, parentId: id })
								}
							/>
						</div>
					))}
				</Flex>
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
	return (
		<div className={classes.wrapper}>
			<CModal
				onClose={onClose}
				onCancel={onClose}
				title={title}
				styles={{
					content: {
						width: 800,
					},
				}}
				footer={[<div key="back"></div>]}
			>
				<Flex vertical className={classes.container}>
					<Flex className={classes.searchBar}>
						<CInput
							onChange={(e) => setTitleTopic(e.target.value)}
							value={titleTopic}
							prefix={<SearchIcon />}
							placeholder="Search"
							style={{ borderRadius: 40, height: 40 }}
						/>
					</Flex>
					{loading ? (
						_renderSkeleton()
					) : (
						<Flex className={classes.content} vertical>
							{category.map((item) => _renderTopic(item))}
						</Flex>
					)}
				</Flex>
			</CModal>
		</div>
	)
}

export default memo(ModalTopic)
