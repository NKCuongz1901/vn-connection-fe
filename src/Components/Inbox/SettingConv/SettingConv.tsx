'use client'
import { IconChevronLeft } from '@tabler/icons-react'
import { Flex, Skeleton } from 'antd'
import clsx from 'clsx'
import { memo, useMemo } from 'react'

import useSettingConv from '@/hooks/Inbox/useSettingConv'

import { arrayFrom } from '@/ultis/array.ults'
import { toJson } from '@/ultis/common.ults'
import { getUserInfo } from '@/ultis/storage.ults'

import CAvatar from '@/Components/Custom/CAvatar'
import CButton from '@/Components/Custom/CButton'
import CImage from '@/Components/Custom/CImage'
import CSwitch from '@/Components/Custom/CSwitch'
import ModalReport from '@/Components/Custom/ModalReport'
import BellIcon from '@/svg/BellIcon'
import FlagIcon from '@/svg/FlagIcon'
import ImageIcon from '@/svg/ImageIcon'
import TrashIcon from '@/svg/TrashIcon'

import classes from './SettingConv.module.scss'

interface SettingConvProps {
	convInfo: any
	members: any[]
	onAction?: any
	[key: string]: any
}
const SettingConv = (props: SettingConvProps) => {
	const { convInfo, members, onAction } = props || {}
	const {
		loading,
		modal,
		openMedia,
		medias,
		_loadmore,
		setOpenMedia,
		setModal,
		onUpdateConvMem,
		onScroll,
		onLoadMore,
	} = useSettingConv({
		convInfo,
		members,
		onAction,
	})
	const userInChat = useMemo(() => {
		return (members || []).find((i) => i.user_id !== getUserInfo()?.id)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toJson(members)])
	const _renderItem = ({
		icon,
		text,
		onClick,
		disabled,
		endComp,
	}: { [key: string]: any } = {}) => {
		return (
			<Flex
				className={clsx(classes.bodyItem, { [classes.disabled]: disabled })}
				onClick={onClick}
			>
				<Flex gap={8}>
					<Flex className={classes.icon}>{icon}</Flex>
					<div>{text}</div>
				</Flex>
				{endComp && <Flex>{endComp}</Flex>}
			</Flex>
		)
	}
	const _renderBody1 = () => {
		const fill = '#7987A4'
		const { is_accept_notification, user_id } = (members || []).find(
			(item) => item.user_id === getUserInfo()?.id,
		)
		return (
			<Flex className={classes.body} vertical>
				{/* {_renderItem({
					icon: <PencilIcon fill={fill} />,
					text: 'Change alias',
					disabled: true,
				})} */}
				{_renderItem({
					icon: <BellIcon fill={fill} />,
					text: 'Mute notification',
					endComp: (
						<Flex>
							<CSwitch
								disabled={!!loading.updateConvMem}
								checked={!is_accept_notification}
								ctype="success"
								onChange={onUpdateConvMem}
							/>
						</Flex>
					),
				})}
				{_renderItem({
					icon: <ImageIcon fill={fill} />,
					text: 'Media',
					onClick: () => setOpenMedia(true),
				})}
				{_renderItem({
					icon: <FlagIcon fill={fill} />,
					text: 'Report an issue',
					onClick: () => setModal({ type: 'report', data: { user_id } }),
				})}
				{/* {_renderItem({
                    icon: <TrashIcon fill={fill} />,
					text: 'Hide this conversation',
					disabled: true,
				})} */}
			</Flex>
		)
	}
	// const _renderBody2 = () => {
	// 	return <Flex>a</Flex>
	// }
	const _renderBody3 = () => {
		return
		return (
			<Flex className={classes.body} vertical>
				{_renderItem({
					icon: <TrashIcon fill={'red'} />,
					text: 'Delete',
				})}
			</Flex>
		)
	}
	const _renderModal = () => {
		const { type, data } = modal || {}

		let content = <></>
		// {
		//     "email": "123a@gmail.cok",
		//     "topic": "Adult content",
		//     "images": [],
		//     "content": "",
		//     "user_id": "cba1f4b0-7117-11ef-816e-ad227b31cf2c"
		//   }
		switch (type) {
			case 'report':
				content = (
					<ModalReport
						open
						onClose={() => setModal(null)}
						data={data}
						title={'Report'}
						message={'You want to report this conversation?'}
					/>
				)
				break
			default:
				break
		}
		return content
	}
	const _renderContent = () => {
		if (openMedia) return
		return (
			<>
				<Flex className={classes.header} vertical>
					<Flex
						className={classes.iconBackHeader}
						onClick={() => onAction({ key: 'back' })}
					>
						<IconChevronLeft />
					</Flex>
					<CAvatar src={userInChat?.user?.avatar} className={classes.avatar} />
					<div className={classes.name}>{userInChat?.user?.name}</div>
				</Flex>
				<Flex className={classes.session}>{_renderBody1()}</Flex>
				{/* <Flex className={classes.session}>{_renderBody2()}</Flex> */}
				<Flex className={classes.session}>{_renderBody3()}</Flex>
			</>
		)
	}
	const _renderMedias = () => {
		if (!openMedia) return
		return (
			<Flex className={classes.medias} vertical>
				<Flex className={classes.mediasHeader}>
					<Flex
						className={classes.mediaBackIcon}
						onClick={() => setOpenMedia(false)}
					>
						<IconChevronLeft />
					</Flex>
					<div>Media</div>
				</Flex>

				<Flex className={classes.mediaListWrapper} onScroll={onScroll}>
					{loading.medias ? (
						arrayFrom(3).map((_, index) => (
							<Flex className={classes.mediaItem} key={index}>
								<Skeleton.Input className={classes.skeleton} />
							</Flex>
						))
					) : (
						<>
							{(medias || []).map((item) => (
								<Flex key={item?.url} className={classes.mediaItem}>
									<CImage src={item?.url} preview />
								</Flex>
							))}
							{_loadmore.current && !loading.medias && (
								<Flex className={classes.loadMore}>
									<CButton ctype="oranger" onClick={onLoadMore}>
										Load More
									</CButton>
								</Flex>
							)}
						</>
					)}
				</Flex>
			</Flex>
		)
	}
	return (
		<div className={classes.wrapper}>
			<Flex className={classes.container} vertical>
				{_renderContent()}
				{_renderMedias()}
				{modal?.type && _renderModal()}
			</Flex>
		</div>
	)
}

export default memo(SettingConv)
