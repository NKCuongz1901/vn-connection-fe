'use client'
import { IconSquareRoundedPlusFilled } from '@tabler/icons-react'
import { Flex, Skeleton } from 'antd'
import clsx from 'clsx'
import { memo } from 'react'

import useCommunity from '@/hooks/Community/useCommunity'

import { arrayFrom, isArray } from '@/ultis/array'
import { onPushState, useLocalePath, useQuery } from '@/ultis/route'

import CheckEmail from '@/Components/CheckEmail'
import ModalCRUDCommunity from '@/Components/Community/ModalCRUDCommunity'
import CAvatarBandage from '@/Components/Custom/CAvatarBandage'
import CButton from '@/Components/Custom/CButton'
import CButtonCreate from '@/Components/Custom/CButtonCreate'
import CInput from '@/Components/Custom/CInput'
import People from '@/svg/People'
import PeopleSmileIcon from '@/svg/PeopleSmileIcon'
import SearchIcon from '@/svg/SearchIcon'
import GroupCommunity from './GroupCommunity'

import { mainRoutes } from '@/routes/MainRoutes'

import classes from './Community.module.scss'

const Community = () => {
	const { onChangeRoute } = useLocalePath()
	const { onGetQuerry } = useQuery()
	const { group_id } = onGetQuerry() || {}
	const isGr = group_id !== null && group_id !== undefined
	const {
		loadingClub,
		loading,
		networkClub,
		networkSuggest,
		keyword,
		modal,
		checkmail,

		setModal,

		setKeyword,
		onGetNetwork,
		onCheckEmail,
		setCheckmail,
		onCheckMailSubmit,
	} = useCommunity({})
	const _renderSearch = () => {
		return (
			<Flex className={classes.search}>
				<CInput
					disabled={loadingClub || loading}
					placeholder="Search"
					value={keyword}
					onChange={(e) => setKeyword(e.target.value)}
					prefix={<SearchIcon />}
				/>
			</Flex>
		)
	}
	const _renderNetworkClub = () => {
		if (loadingClub || loading) {
			return (
				<div className={classes.loading}>
					{arrayFrom(3).map((_, index) => (
						<Flex key={index} className={classes.skeletonWrapper}>
							<Skeleton.Input active className={classes.skeleton} />
						</Flex>
					))}
				</div>
			)
		}

		return (
			<Flex className={classes.networkClubWrapper} vertical>
				{(networkClub || []).map((club) => {
					const { id, count, data } = club
					const { id: idClub, name } = id
					const lastIndex = data.length
					return (
						<Flex key={idClub} vertical className={classes.networkClub}>
							<Flex className={classes.networkTitle}>
								<div className={classes.networkName}>{name}</div>
								<Flex className={classes.networkCount}>{count}</Flex>
							</Flex>
							<Flex
								className={classes.networkList}
								onScroll={(e) => console.log('object', e)}
							>
								{isArray(data, 1) ? (
									data.map((item, index) => {
										const { id, avatar, userRole, title } = item || {}
										const isMore = index === lastIndex - 1 && lastIndex < count
										return (
											<Flex
												key={id}
												vertical
												className={classes.communityItem}
												onClick={() =>
													isMore
														? onPushState({ group_id: idClub })
														: onChangeRoute(`${mainRoutes.community}/${id}`)
												}
											>
												<div className={classes.wrapperAvatar}>
													{isMore && (
														<Flex className={classes.more}>
															+{count - index}
														</Flex>
													)}
													<CAvatarBandage
														isHidden={userRole !== 'OWNER' || isMore}
														src={avatar}
														className={classes.communityAva}
														classBandage={classes.communityBandage}
													/>
												</div>
												<div className={classes.communityLabel}>{title}</div>
											</Flex>
										)
									})
								) : (
									<Flex vertical className={classes.notNetwork}>
										<PeopleSmileIcon />
										<div className={classes.title}>
											Find your first network !
										</div>
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
								)}
							</Flex>
						</Flex>
					)
				})}
			</Flex>
		)
	}

	const _renderNetworkSuggest = () => {
		if (loadingClub || loading) {
			return
		}
		return (
			<Flex className={classes.networkClubWrapper} vertical>
				<Flex vertical className={classes.networkClub}>
					<Flex className={classes.networkTitle}>
						<div className={classes.networkSgName}>Suggestion</div>
					</Flex>
					<Flex className={classes.networkList}>
						{isArray(networkSuggest, 1) ? (
							networkSuggest.map((item) => {
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
							})
						) : (
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
						)}
					</Flex>
				</Flex>
			</Flex>
		)
	}

	const _renderModal = () => {
		const { type } = modal || {}
		let Content = <></>
		const propsModal = {
			open: true,
			onClose: () => setModal({ type: null, data: null }),
			// onSuccess: (item) => onCRUDSuccess({ key: 'create', value: item }),
		}
		switch (type) {
			case 'network':
				Content = (
					<ModalCRUDCommunity
						{...propsModal}
						onSuccess={() => onGetNetwork(true)}
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
				vertical
				className={clsx(classes.container, { [classes.hidden]: !!isGr })}
			>
				<Flex className={classes.header}>
					<Flex gap={8}>
						<People fill="#1E9037" />
						<div>My Community</div>
					</Flex>
					<div className={classes.bntAdd}>
						<CButtonCreate isIcon onClick={() => onCheckEmail('network')}>
							Create community
						</CButtonCreate>
					</div>
					<Flex
						className={classes.buttonAdd}
						onClick={() => onCheckEmail('network')}
					>
						<IconSquareRoundedPlusFilled />
					</Flex>
				</Flex>
				<Flex className={clsx(classes.content)} vertical>
					{_renderSearch()}
					{_renderNetworkClub()}
					{_renderNetworkSuggest()}
				</Flex>
			</Flex>
			{isGr && <GroupCommunity id={group_id} />}
			{_renderModal()}
			{!!checkmail?.open && (
				<CheckEmail
					onSubmit={() => {
						onCheckMailSubmit()
					}}
					onClose={() => setCheckmail({ open: false, type: null })}
				/>
			)}
		</div>
	)
}

export default memo(Community)
