import { SearchOutlined } from '@ant-design/icons'
import { IconSquareRoundedPlusFilled } from '@tabler/icons-react'
import { Dropdown, Flex, Skeleton } from 'antd'
import clsx from 'clsx'
import { forwardRef } from 'react'

import useDetailCommunityMember from '@/hooks/Community/useDetailCommunityMember'

import { arrayFrom } from '@/ultis/array'
import { getUserInfo } from '@/ultis/storage'

import CAvatarBandage from '@/Components/Custom/CAvatarBandage'
import CInput from '@/Components/Custom/CInput'
import StarIcon from '@/svg/Event/StarIcon'
import DetailCommunityAddAdmin from '../DetailCommunityAddAdmin'

import { ConversationProps } from '@/interface/Community/Community.interface'

import classes from './DetailCommunityMember.module.scss'

interface DetailCommunityMemberProp {
	id: string
	info?: ConversationProps
	[key: string]: any
}
const DetailCommunityMember = (props: DetailCommunityMemberProp, ref) => {
	const { id, info } = props
	const { host_id } = info || {}
	const isMe = getUserInfo('id') === host_id

	const {
		loading,
		members,
		admins,
		modal,
		name,
		total,

		setName,
		setModal,
		onGetMenus,
		onSuccess,
		onScroll,
	} = useDetailCommunityMember(props, ref)
	const _renderAdmin = () => {
		return (
			<Flex vertical className={classes.renderAdmin}>
				<Flex className={classes.title}>
					<div>Admins</div>
					{isMe && (
						<Flex
							className={classes.buttonAdd}
							onClick={() => setModal({ type: 'addAdmin', data: { id } })}
						>
							<IconSquareRoundedPlusFilled />
						</Flex>
					)}
				</Flex>
				<Flex className={classes.adminList}>
					{loading.admin ? (
						<Flex className={classes.skeletonWrapper}>
							{arrayFrom(2).map((_, index) => (
								<Flex key={index} vertical className={classes.skeleton}>
									<Skeleton.Avatar active className={classes.skeletonAva} />
									<Skeleton.Input active className={classes.skeletonInput} />
								</Flex>
							))}
						</Flex>
					) : (
						admins.map((admin) => {
							const { type, user } = admin
							const { id, name, avatar } = user
							const isOwner = type === 'OWNER'

							return (
								<Flex vertical key={id}>
									<Dropdown
										trigger={['click']}
										menu={{ items: onGetMenus({ item: admin }) }}
										disabled={!isMe || isOwner}
									>
										<Flex vertical className={classes.admin}>
											<Flex>
												<CAvatarBandage
													src={avatar}
													className={classes.communityAva}
													classBandage={clsx(classes.communityBandage, {
														[classes.communityBandageAdm]: !isOwner,
													})}
													{...(!isOwner && { customeBandage: <StarIcon /> })}
												/>
											</Flex>
											<div className={classes.name}>{name}</div>
										</Flex>
									</Dropdown>
								</Flex>
							)
						})
					)}
				</Flex>
			</Flex>
		)
	}

	const _renderMember = () => {
		return (
			<Flex vertical className={classes.renderMember}>
				<Flex className={classes.title}>
					<Flex className={classes.titleLabel}>
						Members
						<Flex className={classes.total}>{total.member || 0}</Flex>
					</Flex>
				</Flex>
				<Flex className={classes.search}>
					<CInput
						placeholder="Search"
						value={name}
						style={{ borderRadius: 40, height: 40 }}
						prefix={<SearchOutlined className={classes.iconSearch} />}
						onChange={(e) => setName(e.target.value)}
					/>
				</Flex>
				<Flex className={classes.adminList} onScroll={onScroll}>
					{members.map((member) => {
						const { type, user } = member
						const { id, name, avatar } = user
						const isOwner = type === 'OWNER'
						const isMember = type === 'MEMBER'
						return (
							<Flex vertical key={id}>
								<Dropdown
									trigger={['click']}
									menu={{ items: onGetMenus({ item: member }) }}
									disabled={!isMe || isOwner}
								>
									<Flex vertical className={classes.admin}>
										<Flex>
											<CAvatarBandage
												isHidden={isMember}
												src={avatar}
												className={classes.communityAva}
												classBandage={clsx(classes.communityBandage, {
													[classes.communityBandageAdm]: !isOwner,
												})}
												{...(!isOwner && { customeBandage: <StarIcon /> })}
											/>
										</Flex>
										<div className={classes.name}>{name}</div>
									</Flex>
								</Dropdown>
							</Flex>
						)
					})}
					{loading.member && (
						<Flex className={classes.skeletonWrapper}>
							{arrayFrom(2).map((_, index) => (
								<Flex key={index} vertical className={classes.skeleton}>
									<Skeleton.Avatar active className={classes.skeletonAva} />
									<Skeleton.Input active className={classes.skeletonInput} />
								</Flex>
							))}
						</Flex>
					)}
				</Flex>
			</Flex>
		)
	}

	const _renderModal = () => {
		const { type, data } = modal || {}
		let Content = <></>
		const propsModal = {
			open: true,
			data,
			onCancel: () => {
				setModal({})
			},
			onClose: () => {
				setModal({})
			},
			onSuccess: onSuccess,
			// onCopy: () => onCopy(data?.props?.share_link),
		}
		switch (type) {
			// case 'share':
			// 	{
			// 		Content = (
			// 			<ModalMyFriend
			// 				title="Share friend"
			// 				{...propsModal}
			// 				customComp={_renderMyFriendComp}
			// 			/>
			// 		)
			// 	}
			// 	break
			case 'addAdmin':
				{
					Content = <DetailCommunityAddAdmin {...propsModal} />
				}
				break
			default:
				break
		}
		return Content
	}
	return (
		<div className={classes.wrapper}>
			<Flex className={clsx(classes.container, {})} vertical>
				{_renderAdmin()}
				{_renderMember()}
				{_renderModal()}
			</Flex>
		</div>
	)
}

export default forwardRef(DetailCommunityMember)
