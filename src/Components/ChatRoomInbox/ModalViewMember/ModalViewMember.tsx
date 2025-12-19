'use client'
import { SearchOutlined } from '@ant-design/icons'
import { Flex, Skeleton } from 'antd'
import clsx from 'clsx'

import useModalViewMember from '@/hooks/ChatRoomInbox/useModalViewMember'

import { arrayFrom } from '@/ultis/array.ults'
import { useLocalePath } from '@/ultis/route.ults'
import { formatNumberString } from '@/ultis/string.ults'

import CAvatar from '@/Components/Custom/CAvatar'
import CInput from '@/Components/Custom/CInput'
import CModal from '@/Components/Custom/CModal/CModal'
import DotIcon from '@/svg/DotIcon'
import FeMaleIcon from '@/svg/FeMaleIcon'
import GenderIcon from '@/svg/GenderIcon'
import MaleIcon from '@/svg/MaleIcon'
import MarkIcon from '@/svg/MarkIcon'

import { MemberProps } from '@/interface/Conversation/Conversation.interface'
import { mainRoutes } from '@/routes/MainRoutes'

import { mappingFlag } from '@/Variable/countryVariable'
import classes from './ModalViewMember.module.scss'

interface ModelChooseHangoutProps {
	id: string
	onClose: () => void
}

const genderIcon = {
	MALE: MaleIcon,
	FEMALE: FeMaleIcon,
	OTHER: GenderIcon,
}

const ModalViewMember = ({ id, onClose }: ModelChooseHangoutProps) => {
	const { onOpenNewRoute } = useLocalePath()

	const {
		refInput,

		loading,

		keyword,
		local,
		memberAround,
		memberAll,
		total,

		onScroll,
		onChangeKeyword,
	} = useModalViewMember({ id })

	const _renderLoading = () => {
		return (
			<>
				{arrayFrom(5).map((_, index) => (
					<Flex key={index} vertical className={classes.skeleton}>
						<Skeleton.Avatar active className={classes.skeletonAva} />
						<Skeleton.Input active className={classes.skeletonLabel} />
						<Skeleton.Input active className={classes.skeletonLabel} />
						<Skeleton.Input active className={classes.skeletonLabel} />
					</Flex>
				))}
			</>
		)
	}
	const _renderItem = (item: MemberProps) => {
		const { user } = item || {}
		const { avatar, name, country_code, age, id, address_local } = user || {}
		const IconGender = genderIcon.OTHER

		return (
			<Flex key={id} vertical className={classes.user}>
				<Flex className={classes.userAvatarWrapper}>
					<CAvatar
						src={avatar}
						className={classes.userAvatar}
						onClick={() => {
							if (id) onOpenNewRoute(`${mainRoutes.profile}/${id}`)
						}}
					/>
					<div className={classes.flagWrapper}>
						<div
							className={clsx(
								`flag:${mappingFlag[country_code] || country_code}`,
								classes.flag,
							)}
						/>
					</div>
				</Flex>
				<div className={classes.userName}> {name}</div>
				<Flex align="center" gap={4}>
					{!!age && (
						<>
							<div className={classes.userOtherInfo}> {age} yrs</div>
							<DotIcon />
						</>
					)}
					{!!IconGender && (
						<div
							className={clsx({
								[classes.iconGender]: true,
							})}
						>
							<IconGender fill="#2381FF" />
						</div>
					)}
				</Flex>
				<Flex className={classes.addressLocal}>
					<div className={classes.icon}>
						<MarkIcon fill="#7987A4" />
					</div>
					<div>{address_local}</div>
				</Flex>
			</Flex>
		)
	}
	const _renderAroundMe = () => {
		const { address } = local || {}
		const _address = address?.split(',').slice(-2).join(', ')
		const isMore = total.around - memberAround.length > 0
		return (
			<Flex className={classes.section} vertical>
				<Flex className={classes.header} vertical>
					<div className={classes.title}>Around me</div>
					<div className={classes.subTitle}>{_address}</div>
				</Flex>
				<Flex className={classes.userList}>
					{memberAround.slice(0, 7).map(_renderItem)}
					{isMore && !loading.around && (
						<Flex className={clsx(classes.moreAround, classes.user)} vertical>
							<Flex className={classes.userAvatarWrapper}>
								<CAvatar
									src={memberAround[7]?.user?.avatar}
									className={classes.userAvatar}
									onClick={() => onOpenNewRoute(`${mainRoutes.profile}/${id}`)}
								/>
							</Flex>
							<Flex className={classes.moreAroundMe}>
								+{formatNumberString(total.around - memberAround.length + 1)}
							</Flex>
						</Flex>
					)}
					{loading.around && _renderLoading()}
				</Flex>
			</Flex>
		)
	}
	const _renderAll = () => {
		return (
			<Flex className={classes.section} vertical>
				<Flex className={classes.header} vertical>
					<div className={classes.title}>All members</div>
				</Flex>
				<Flex className={classes.userList}>
					{memberAll.map(_renderItem)}
					{loading.all && _renderLoading()}
				</Flex>
			</Flex>
		)
	}
	return (
		<div className={classes.wrapper}>
			<CModal
				onClose={onClose}
				onCancel={onClose}
				title={'Member'}
				styles={{
					content: {
						width: 800,
					},
				}}
				footer={[<div key="1" />]}
			>
				<div className={classes.container} onScroll={onScroll}>
					<CInput
						ref={refInput}
						disabled={loading.all || loading.around}
						placeholder="Search by keyword"
						style={{ borderRadius: 40, height: 40 }}
						prefix={<SearchOutlined className={classes.filterSearchIcon} />}
						onChange={onChangeKeyword}
						value={keyword}
					/>
					{_renderAroundMe()}
					{_renderAll()}
				</div>
			</CModal>
		</div>
	)
}

export default ModalViewMember
