import {
	IconCameraFilled,
	IconChevronDown,
	IconMapPinFilled,
} from '@tabler/icons-react'
import { Flex, Skeleton } from 'antd'
import { memo, useCallback } from 'react'

import { useLoading } from '@/context/LoadingContext'
import useCRUDCommunity from '@/hooks/Community/useCRUDCommunity'

import { toJson } from '@/ultis/common'

import CAvatar from '@/Components/Custom/CAvatar'
import CButton from '@/Components/Custom/CButton'
import CImage from '@/Components/Custom/CImage'
import CInput from '@/Components/Custom/CInput'
import CInputMap from '@/Components/Custom/CInputMap'
import CModal from '@/Components/Custom/CModal/CModal'
import CMultiSelect from '@/Components/Custom/CMultiSelect'
import CSelect from '@/Components/Custom/CSelect'
import CSwitch from '@/Components/Custom/CSwitch'
import CTextArea from '@/Components/Custom/CTextArea'
import CUpload from '@/Components/Custom/CUpload'
import HappyIcon from '@/svg/HappyIcon'
import PeopleHexagonIcon from '@/svg/PeopleHexagonIcon'

import { typeCommunity } from '@/Variable/select.variable'

import classes from './ModalCRUDCommunity.module.scss'

interface ModalCRUDCommunityProps {
	data?: any
	onClose: () => void
	onSuccess?: (data: any) => void
}

const ModalCRUDCommunity = ({
	data,
	onClose,
	onSuccess,
}: ModalCRUDCommunityProps) => {
	const { loadingContext } = useLoading()
	const {
		loadingOpt,
		categoryNetworkOpts,
		dataModal,
		errors,
		onChangeData,
		onCheckImage,
		onSubmit,
	} = useCRUDCommunity({
		data,
		onSuccess,
		onClose,
	})
	const { id } = data || {}

	const _renderTop = useCallback(() => {
		const { thumbnail, avatar, title } = dataModal || {}
		return (
			<Flex className={classes.top} vertical>
				<Flex className={classes.cover}>
					<CImage
						preview
						className={classes.image}
						src={thumbnail || '/images/defaultCover.png'}
					/>
					<Flex className={classes.camera}>
						<CUpload onChange={(e) => onCheckImage('thumbnail', e.file)}>
							<IconCameraFilled className={classes.iconCamera} />
						</CUpload>
					</Flex>
				</Flex>
				<Flex className={classes.avatarWrapper}>
					<Flex className={classes.avatar}>
						<CAvatar src={avatar || ''} size={96} />

						<Flex className={classes.camera}>
							<CUpload onChange={(e) => onCheckImage('avatar', e.file)}>
								<IconCameraFilled className={classes.iconCamera} />
							</CUpload>
						</Flex>
					</Flex>
				</Flex>
				<Flex className={classes.name}>
					<CInput
						showCount
						value={title}
						error={errors.title}
						maxLength={30}
						label="Community name"
						isRequired
						placeholder="Community name"
						onChange={(e) => onChangeData('title', e.target.value)}
					/>
				</Flex>
			</Flex>
		)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toJson(dataModal), toJson(errors)])
	const _renderBottom = useCallback(() => {
		return (
			<Flex className={classes.bottom}>
				{_renderLeft()}
				{_renderRight()}
			</Flex>
		)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toJson(dataModal), toJson(errors), loadingOpt])
	const _renderLeft = () => {
		const {
			bio,
			type,
			category,
			longitude,
			latitude,
			address,
			is_online,
			is_offline,
		} = dataModal || {}
		return (
			<Flex className={classes.left} vertical>
				<CInput
					isRequired
					showCount={true}
					value={bio}
					error={errors.bio}
					label="Bio"
					placeholder="Bio"
					prefix={<PeopleHexagonIcon />}
					onChange={(e) => onChangeData('bio', e.target.value)}
					maxLength={30}
				/>
				<Flex className={classes.item}>
					<CSelect
						isRequired
						showCount
						value={type}
						options={typeCommunity}
						error={errors.type}
						label="State"
						placeholder="Choose your state"
						onChange={(e) => onChangeData('type', e)}
						prefix={<HappyIcon />}
					/>
				</Flex>
				<Flex className={classes.item}>
					<CMultiSelect
						isRequired
						max={3}
						suffixIcon={<IconChevronDown />}
						label="Category"
						options={categoryNetworkOpts}
						value={category}
						error={errors.category}
						onChange={(e) => onChangeData('category', e)}
					/>
				</Flex>
				<Flex className={classes.item}>
					<span className={classes.title}>This is an Online Community ?</span>

					<CSwitch
						ctype="success"
						checked={is_online}
						onChange={(e) => onChangeData('is_online', e)}
					/>
				</Flex>
				<Flex className={classes.item}>
					<span className={classes.title}>This is an Offline Community ?</span>

					<CSwitch
						ctype="success"
						checked={is_offline}
						onChange={(e) => onChangeData('is_offline', e)}
					/>
				</Flex>
				{is_offline && (
					<Flex className={classes.item}>
						<CInputMap
							value={address}
							error={errors.address}
							isRequired
							label="Location"
							placeholder="Enter your location"
							longitude={longitude}
							latitude={latitude}
							onSubmitModal={(e) => onChangeData('address', e)}
							prefix={<IconMapPinFilled style={{ color: '#7987A4' }} />}
						/>
					</Flex>
				)}
			</Flex>
		)
	}
	const _renderRight = () => {
		const { about } = dataModal || {}
		return (
			<Flex className={classes.right}>
				<CTextArea
					isRequired
					isFullHeight
					showCount
					label="About"
					placeholder={`Share your community’s purpose or vibe.
								What’s this community about?
								Tell what members can do here.
								Describe your main topic or goal. 
								What makes your community special?`}
					value={about}
					error={errors.about}
					maxLength={2000}
					onChange={(e) => onChangeData('about', e.target.value)}
				/>
			</Flex>
		)
	}
	const _renderLoading = () => {
		return <Skeleton.Input active className={classes.skeleton} />
	}
	return (
		<div className={classes.wrapper}>
			<CModal
				onClose={onClose}
				onCancel={onClose}
				title={id ? 'Edit community' : 'Create community'}
				styles={{
					content: {
						width: 800,
					},
				}}
				footer={[
					<Flex key="back" justify="flex-end">
						<CButton
							disabled={loadingContext}
							onClick={onSubmit}
							ctype="oranger"
							style={{ width: 200 }}
						>
							{id ? 'Edit community' : 'Create community'}
						</CButton>
					</Flex>,
				]}
			>
				<div className={classes.container}>
					<Flex className={classes.wrapperModal}>
						{loadingOpt ? (
							_renderLoading()
						) : (
							<>
								{_renderTop()}
								{_renderBottom()}
							</>
						)}
					</Flex>
				</div>
			</CModal>
		</div>
	)
}

export default memo(ModalCRUDCommunity)
