import { SearchOutlined } from '@ant-design/icons'
import { Flex, Skeleton } from 'antd'
import { memo } from 'react'

import useMyFriend from '@/hooks/Friend/useMyFriend'

import { arrayFrom, isArray } from '@/ultis/array.ults'

import CAvatar from '@/Components/Custom/CAvatar'
import CInput from '@/Components/Custom/CInput'
import NotFound from '@/svg/NotFound'

import classes from './MyFriend.module.scss'
interface MyFriendProps {
	customComp?: any
	desc?: {
		icon?: any
		label?: string
	}
	onCopy?: any
	[key: string]: any
}
const MyFriend = (_props: MyFriendProps) => {
	const { customComp, desc, onCopy } = _props
	const { icon, label } = desc || {}
	const {
		loading,
		searchText,
		setSearchText,
		_parentRef,
		_childRef,
		friendList,
		onScroll,
	} = useMyFriend({})
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
				{desc && (
					<Flex className={classes.desc} onClick={onCopy}>
						<Flex className={classes.iconDesc}>{icon}</Flex>
						<Flex className={classes.title}>{label}</Flex>
					</Flex>
				)}
				<Flex className={classes.friendListWrapper} vertical ref={_parentRef}>
					<span className={classes.title}>Friend list suggestion</span>
					<Flex
						vertical
						className={classes.friendList}
						ref={_childRef}
						onScroll={onScroll}
					>
						{isArray(friendList, 1)
							? friendList.map((item: any) => {
									const { friend } = item || {}
									const { avatar, name, id } = friend || {}
									return (
										<Flex key={id} className={classes.friendItem}>
											<Flex className={classes.left}>
												<CAvatar src={avatar} />
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
										{/* <span>Do you want to explore more friends?</span>
										<Flex
											className={classes.exploreButton}
											onClick={() => onChangeRoute(mainRoutes.search)}
										>
											<CButton ctype="oranger">Explore now</CButton>
										</Flex> */}
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

export default memo(MyFriend)
