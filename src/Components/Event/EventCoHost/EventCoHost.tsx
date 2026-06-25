import { IconTrash } from '@tabler/icons-react'
import { Dropdown, Flex } from 'antd'
import { ItemType } from 'antd/es/menu/interface'
import Link from 'next/link'
import { memo } from 'react'

import useEventCoHost from '@/hooks/Event/useEventCoHost'

import { isArray } from '@/ultis/array'
import { useLocalePath } from '@/ultis/route'
import { getUserInfo } from '@/ultis/storage'

import CAvatar from '@/Components/Custom/CAvatar'
import CAvatarBandage from '@/Components/Custom/CAvatarBandage'
import CButton from '@/Components/Custom/CButton'
import CModal from '@/Components/Custom/CModal/CModal'
import ModalMyFriend from '@/Components/Friend/ModalMyFriend'
import StarIcon from '@/svg/Event/StarIcon'

import { mainRoutes } from '@/routes/MainRoutes'

import classes from './EventCoHost.module.scss'
import { repeatOpt } from '@/Variable/select.variable'

const EventCoHost = ({
	id,
	user,
	detailPost,
	onCallBack = () => null,
	isPublic,
	onRequireLogin,
}) => {
	const { onGetPath } = useLocalePath()
	const { avatar: uAvatar, name, id: user_id } = user || {}
	const {
		openModal,
		loading,
		total,
		participantList,
		loadingCoHost,
		onSetOpenModal,
		onGetMenus,
		onMenusClick,
	} = useEventCoHost({ id, user, onCallBack, isPublic })
	const { repeat_type } = detailPost || {}
	const { type } = repeat_type || {}
	const isRepeat = type !== repeatOpt[0].value
	const isAdd =
		!isPublic &&
		((!isArray(participantList, 3) &&
			!!participantList.find((item) => item.user_id === getUserInfo('id'))) ||
			user?.id === getUserInfo('id'))

	const handleOpenModal = (payload: { type: any; dataModal?: any }) => {
		if (isPublic && payload.type !== 'allHost') {
			onRequireLogin?.()
			return
		}
		onSetOpenModal(payload)
	}

	const handleProfileClick = (
		e: React.MouseEvent,
		profileUserId: string,
	) => {
		if (!isPublic) return
		e.preventDefault()
		onRequireLogin?.()
	}

	const _renderModalAllCoHost = (_props: {
		dataModal: any
		open: boolean
		onCancel: () => void
		onClose: () => void
	}) => {
		const { open, onClose, onCancel } = _props

		return (
			<CModal
				open={open}
				onClose={onClose}
				onCancel={onCancel}
				title={'Co-host'}
				styles={{
					content: {
						width: 800,
					},
				}}
				footer={[<div key="back"></div>]}
			>
				<Flex vertical className={classes.participantList}>
					<Flex className={classes.participantItem}>
						<Link
							href={onGetPath(`${mainRoutes.profile}/${user_id}`)}
							target="_blank"
							onClick={(e) => handleProfileClick(e, user_id)}
						>
							<Flex className={classes.left}>
								<CAvatarBandage src={uAvatar} />
								<span className={classes.name}>{name}</span>
							</Flex>
						</Link>
					</Flex>
					{isArray(participantList, 1) &&
						participantList.map((item: any) => {
							const { isOnwer, isAdmin, user, id, user_id } = item || {}
							const { avatar, name } = user || {}
							const menus: ItemType[] = onGetMenus({
								id: user_id,
								isUpgrate: false,
							})
							const Content = isOnwer || isAdmin ? CAvatarBandage : CAvatar

							return (
								<Flex key={id} className={classes.participantItem}>
									<Link
										href={onGetPath(`${mainRoutes.profile}/${user_id}`)}
										target="_blank"
										onClick={(e) => handleProfileClick(e, user_id)}
									>
										<Flex className={classes.left}>
											<Content
												src={avatar}
												{...(isAdmin && { customeBandage: <StarIcon /> })}
											/>{' '}
											<span className={classes.name}>{name}</span>
										</Flex>
									</Link>
									<Flex className={classes.right}>
										{!isPublic &&
											(isRepeat ? (
												<Dropdown
													menu={{ items: menus }}
													trigger={['click']}
													disabled={loadingCoHost}
												>
													<IconTrash className={classes.iconTrash} />
												</Dropdown>
											) : (
												<div
													onClick={() =>
														onMenusClick({
															key: 'ALL',
															id: user_id,
															isUpgrate: false,
														})
													}
												>
													<IconTrash className={classes.iconTrash} />
												</div>
											))}
									</Flex>
								</Flex>
							)
						})}
				</Flex>
			</CModal>
		)
	}

	const _renderModal = () => {
		const { type, dataModal } = openModal
		let Content = <></>
		const propsModal = {
			open: true,
			onCancel: () => onSetOpenModal({}),
			onClose: () => onSetOpenModal({}),
			// onSuccess: onSuccess,
		}
		switch (type) {
			case 'coHost':
				{
					Content = (
						<ModalMyFriend
							title="Add co-host"
							desc={{
								label: 'Only add max 3 co-hosts',
							}}
							{...propsModal}
							customComp={_renderMyFriendComp}
						/>
					)
				}
				break
			case 'allHost':
				{
					Content = _renderModalAllCoHost({
						...propsModal,
						dataModal: dataModal,
					})
				}
				break
			default:
				break
		}
		return Content
	}
	const _renderMyFriendComp = (data: any) => {
		const { friend } = data || {}
		const { id } = friend || {}
		const { id: adm_id } = user || {}
		const isUpgrate = !participantList.find((item) => item.user_id === id)
		const isAdm = adm_id === id
		const isMe = id === getUserInfo('id')
		const isMax = isArray(participantList, 3)
		if (isAdm || isMe) return <></>
		if (isMax && isUpgrate) return <></>
		const menus: ItemType[] = onGetMenus({ id, isUpgrate })

		return (
			<div className={classes.btnAddHost}>
				{isRepeat ? (
					<Dropdown
						trigger={['click']}
						menu={{ items: menus }}
						disabled={loadingCoHost}
					>
						<CButton ctype="oranger">{isUpgrate ? 'Add' : 'Delete'}</CButton>
					</Dropdown>
				) : (
					<div
						onClick={() =>
							onMenusClick({
								key: 'ALL',
								id,
								isUpgrate,
							})
						}
					>
						<CButton ctype="oranger">{isUpgrate ? 'Add' : 'Delete'}</CButton>
					</div>
				)}
			</div>
		)
	}
	return (
		<>
			<Flex className={classes.hostBy}>
				<Flex className={classes.top}>
					<div
						className={classes.title}
						onClick={() =>
							handleOpenModal({ type: 'allHost', dataModal: participantList })
						}
					>
						Host by
					</div>
					<div style={{ display: 'none' }}>{(total || 0) + 1}</div>
				</Flex>
				<Flex className={classes.hostList}>
					{isAdd && !loading && (
						<div
							className={classes.addHost}
							onClick={() => handleOpenModal({ type: 'coHost' })}
						>
							+
						</div>
					)}
					{participantList.map((item) => (
						<Link
							href={onGetPath(`${mainRoutes.profile}/${item.user_id}`)}
							key={item.id}
							target="_blank"
							onClick={(e) => handleProfileClick(e, item.user_id)}
						>
							<CAvatarBandage
								src={item.user.avatar}
								key={item.id}
								customeBandage={<StarIcon />}
							/>
						</Link>
					))}
					<Link
						href={onGetPath(`${mainRoutes.profile}/${user.id}`)}
						target="_blank"
						onClick={(e) => handleProfileClick(e, user.id)}
					>
						<CAvatarBandage src={uAvatar} />
					</Link>
				</Flex>
			</Flex>
			{_renderModal()}
		</>
	)
}

export default memo(EventCoHost)
