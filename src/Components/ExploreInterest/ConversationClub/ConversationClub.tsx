import { SearchOutlined } from '@ant-design/icons'
import { Flex, Skeleton } from 'antd'
import { memo } from 'react'

import useConversationClub from '@/hooks/ExploreInterest/useConversationClub'

import { arrayFrom, isArray } from '@/ultis/array'
import { useLocalePath } from '@/ultis/route'

import CAvatar from '@/Components/Custom/CAvatar'
import CButton from '@/Components/Custom/CButton'
import CInput from '@/Components/Custom/CInput'
import NotFound from '@/svg/NotFound'

import { mainRoutes } from '@/routes/MainRoutes'

import classes from './ConversationClub.module.scss'
interface ConversationClubProps {
	customComp?: any
	id?: string
	desc?: {
		icon?: any
		label?: string
	}
	onCopy?: any
	[key: string]: any
}
const ConversationClub = (_props: ConversationClubProps) => {
	const { customComp } = _props
	const { onChangeRoute } = useLocalePath()
	const {
		loading,
		searchText,
		setSearchText,
		_parentRef,
		_childRef,
		clubList,
		onScroll,
	} = useConversationClub(_props)
	return (
		<div className={classes.wrapper}>
			<Flex className={classes.container} vertical>
				<Flex className={classes.search}>
					<CInput
						placeholder="Search"
						value={searchText}
						style={{ borderRadius: 40, height: 40 }}
						prefix={<SearchOutlined className={classes.iconSearch} />}
						onChange={(e) => setSearchText(e.target.value)}
					/>
				</Flex>
				<Flex className={classes.friendListWrapper} vertical ref={_parentRef}>
					<Flex
						vertical
						className={classes.friendList}
						ref={_childRef}
						onScroll={onScroll}
					>
						{isArray(clubList, 1)
							? clubList.map((item: any) => {
									const { avatar, title: name, id } = item || {}

									return (
										<Flex key={id} className={classes.friendItem}>
											<Flex className={classes.left}>
												<div>
													<CAvatar src={avatar} />
												</div>
												<span className={classes.name}>{name}</span>
											</Flex>
											<Flex className={classes.right}>
												{customComp && customComp(item)}
											</Flex>
										</Flex>
									)
							  })
							: !loading && (
									<Flex className={classes.notFound} vertical>
										<NotFound />
										<div className={classes.title}>No results found</div>
										<span>Do you want to explore more friends?</span>
										<Flex
											className={classes.exploreButton}
											onClick={() => onChangeRoute(mainRoutes.search)}
										>
											<CButton ctype="oranger">Explore now</CButton>
										</Flex>
									</Flex>
							  )}
						{loading &&
							arrayFrom(3).map((_, index) => (
								<Skeleton.Input
									key={index}
									active
									className={classes.contentBody}
								/>
							))}
					</Flex>
				</Flex>
			</Flex>
		</div>
	)
}

export default memo(ConversationClub)
