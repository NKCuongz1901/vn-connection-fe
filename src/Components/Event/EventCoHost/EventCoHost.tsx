import { IconTrash } from '@tabler/icons-react'
import { Dropdown, Flex } from 'antd'
import { ItemType } from 'antd/es/menu/interface'
import Link from 'next/link'
import { memo } from 'react'

import useEventCoHost from '@/hooks/Event/useEventCoHost'

import { isArray } from '@/ultis/array.ults'
import { useLocalePath } from '@/ultis/route.ults'
import { getUserInfo } from '@/ultis/storage.ults'

import CAvatar from '@/Components/Custom/CAvatar'
import CAvatarBandage from '@/Components/Custom/CAvatarBandage'
import CButton from '@/Components/Custom/CButton'
import CModal from '@/Components/Custom/CModal/CModal'
import ModalMyFriend from '@/Components/Friend/ModalMyFriend'
import StarIcon from '@/svg/Event/StarIcon'

import { mainRoutes } from '@/routes/MainRoutes'

import classes from './EventCoHost.module.scss'

const EventCoHost = ({ id, user, onCallBack = () => null }) => {
	const { onGetPath } = useLocalePath()
	const { avatar: uAvatar } = user || {}
	const {
		openModal,
		loading,
		total,
		participantList,
		loadingCoHost,
		onSetOpenModal,
		onGetMenus,
	} = useEventCoHost({ id, user, onCallBack })
	const isAdd =
		(!isArray(participantList, 3) &&
			!!participantList.find((item) => item.user_id === getUserInfo('id'))) ||
		user?.id === getUserInfo('id')

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
					{isArray(participantList, 1) ? (
						participantList.map((item: any) => {
							const { user, id, user_id } = item || {}
							const { avatar, name } = user || {}
							const menus: ItemType[] = onGetMenus({
								id: user_id,
								isUpgrate: false,
							})

							return (
								<Flex key={id} className={classes.participantItem}>
									<Link
										href={onGetPath(`${mainRoutes.profile}/${user_id}`)}
										target="_blank"
									>
										<Flex className={classes.left}>
											<CAvatar src={avatar} />
											<span className={classes.name}>{name}</span>
										</Flex>
									</Link>
									<Flex className={classes.right}>
										<Dropdown
											menu={{ items: menus }}
											trigger={['click']}
											disabled={loadingCoHost}
										>
											<IconTrash className={classes.iconTrash} />
										</Dropdown>
									</Flex>
								</Flex>
							)
						})
					) : (
						<Flex className={classes.notFound}>
							This activity has no co-host
						</Flex>
					)}
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
				<Dropdown
					trigger={['click']}
					menu={{ items: menus }}
					disabled={loadingCoHost}
				>
					<CButton ctype="oranger">{isUpgrate ? 'Add' : 'Delete'}</CButton>
				</Dropdown>
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
							onSetOpenModal({ type: 'allHost', dataModal: participantList })
						}
					>
						Host by
					</div>
					<div>{total}</div>
				</Flex>
				<Flex className={classes.hostList}>
					{isAdd && !loading && (
						<div
							className={classes.addHost}
							onClick={() => onSetOpenModal({ type: 'coHost' })}
						>
							+
						</div>
					)}
					{participantList.map((item) => (
						<Link
							href={onGetPath(`${mainRoutes.profile}/${item.user_id}`)}
							key={item.id}
							target="_blank"
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
