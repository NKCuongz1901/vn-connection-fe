import { Flex, Skeleton } from 'antd'

import useGroupCommunity from '@/hooks/Community/useGroupCommunity'

import { arrayFrom, isArray } from '@/ultis/array'
import { onPushState, useLocalePath } from '@/ultis/route'

import CAvatarBandage from '@/Components/Custom/CAvatarBandage'
import CButton from '@/Components/Custom/CButton'
import CInput from '@/Components/Custom/CInput'
import ArrrowLeftIcon from '@/svg/ArrrowLeftIcon'
import People from '@/svg/People'
import PeopleSmileIcon from '@/svg/PeopleSmileIcon'
import SearchIcon from '@/svg/SearchIcon'

import { mainRoutes } from '@/routes/MainRoutes'

import classes from './GroupCommunity.module.scss'

const GroupCommunity = (props: { id: string }) => {
	const { onChangeRoute } = useLocalePath()
	const { loading, keyword, network, setKeyword, onScroll } =
		useGroupCommunity(props)
	const _renderSearch = () => {
		return (
			<Flex className={classes.search}>
				<CInput
					placeholder="Search"
					value={keyword}
					onChange={(e) => setKeyword(e.target.value)}
					prefix={<SearchIcon />}
				/>
			</Flex>
		)
	}
	const _renderSkeleton = () => {
		return arrayFrom(3).map((_, index) => (
			<Flex key={index} className={classes.skeletonWrapper} vertical>
				<Skeleton.Avatar active className={classes.skeletonAva} />
				<Skeleton.Input active className={classes.skeleton} />
			</Flex>
		))
	}
	const _renderContent = () => {
		return (
			<Flex className={classes.networkClubWrapper} vertical>
				<Flex vertical className={classes.networkClub}>
					<Flex className={classes.networkList}>
						{isArray(network, 1) || loading ? (
							<>
								{network.map((item) => {
									const { id, avatar, title } = item || {}
									return (
										<Flex
											key={id}
											vertical
											className={classes.communityItem}
											onClick={() =>
												onChangeRoute(`${mainRoutes.community}/${id}`)
											}
										>
											<div>
												<CAvatarBandage
													isHidden={true}
													src={avatar}
													className={classes.communityAva}
													classBandage={classes.communityBandage}
												/>
											</div>
											<div className={classes.communityLabel}>{title}</div>
										</Flex>
									)
								})}
								{loading && _renderSkeleton()}
							</>
						) : (
							!loading && (
								<Flex vertical className={classes.notNetwork}>
									<PeopleSmileIcon />
									<div className={classes.title}>Find your first network !</div>
									<div className={classes.note}>
										Clubs, Communities, Businesses
									</div>
									<CButton
										ctype="oranger"
										onClick={() => onChangeRoute(mainRoutes.search)}
									>
										Explore now
									</CButton>
								</Flex>
							)
						)}
					</Flex>
				</Flex>
			</Flex>
		)
	}
	return (
		<div className={classes.wrapper}>
			<Flex vertical className={classes.container}>
				<Flex className={classes.header}>
					<Flex gap={8} align="center">
						<div className={classes.back} onClick={() => onPushState({})}>
							<ArrrowLeftIcon fill="#0f1729" />
						</div>
						<People fill="#1E9037" />
						<div>My Community</div>
					</Flex>
				</Flex>
				<Flex className={classes.content} vertical onScroll={onScroll}>
					{_renderSearch()}
					{_renderContent()}
				</Flex>
			</Flex>
		</div>
	)
}

export default GroupCommunity
