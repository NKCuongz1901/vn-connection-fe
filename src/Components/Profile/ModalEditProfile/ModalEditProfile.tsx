import {
	IconCameraFilled,
	IconGenderBigender,
	IconHeartFilled,
	IconHeartPin,
	IconMapPinFilled,
	IconMoodSmileFilled,
	IconUserCog,
	IconUserFilled,
	IconUserHeart,
	IconWorld,
} from '@tabler/icons-react'
import { Flex, Image } from 'antd'
import dayjs from 'dayjs'

import { useLoading } from '@/context/LoadingContext'
import useEditProfile from '@/hooks/Profile/useEditProfile'

import CAvatar from '@/Components/Custom/CAvatar'
import CButton from '@/Components/Custom/CButton'
import CDatePicker from '@/Components/Custom/CDatePicker'
import CInput from '@/Components/Custom/CInput'
import CInputMap from '@/Components/Custom/CInputMap'
import CModal from '@/Components/Custom/CModal/CModal'
import CSelect from '@/Components/Custom/CSelect'
import CSelectMuti from '@/Components/Custom/CSelectMuti'
import CTextArea from '@/Components/Custom/CTextArea'
import CUpload from '@/Components/Custom/CUpload'

import {
	formatDate,
	genderOpts,
	languageOpts,
	modOpts,
} from '@/Variable/common.variable'

import classes from './ModalEditProfile.module.scss'

interface ModalEditProfileProps {
	open: boolean
	onClose: any
	data?: any
	onGetUserProfile?: any
	[key: string]: any
}

const ModalEditProfile = (props: ModalEditProfileProps) => {
	const { onClose, open } = props
	const { loadingContext } = useLoading()
	const { dataModal, errors, onSubmit, onCheckImage, onChangeData } =
		useEditProfile(props)

	const _renderTop = () => {
		const { avatar, cover } = dataModal || {}

		return (
			<Flex className={classes.top} vertical>
				<Flex className={classes.cover}>
					<Image
						className={classes.image}
						src={cover || '/images/defaultCover.png'}
					/>
					<Flex className={classes.camera}>
						<CUpload onChange={(e) => onCheckImage('cover', e.file)}>
							<IconCameraFilled className={classes.iconCamera} />
						</CUpload>
					</Flex>
				</Flex>
				<Flex className={classes.avatarWrapper}>
					<Flex className={classes.avatar}>
						<CAvatar src={avatar} size={96} />

						<Flex className={classes.camera}>
							<CUpload onChange={(e) => onCheckImage('avatar', e.file)}>
								<IconCameraFilled className={classes.iconCamera} />
							</CUpload>
						</Flex>
					</Flex>
				</Flex>
			</Flex>
		)
	}

	const _renderMiddle = () => {
		const { about_me } = dataModal
		return (
			<Flex className={classes.about}>
				<CTextArea
					showCount
					isRequired
					label="About"
					error={errors.about_me}
					value={about_me}
					maxLength={200}
					placeholder="Write something about you"
					onChange={(e) => onChangeData('about_me', e.target.value)}
				/>
			</Flex>
		)
	}

	const _renderBottom = () => {
		const {
			name,
			birthday,
			gender,
			address,
			mode,
			who_i_am,
			looking_for,
			i_can_offer,
			i_am_interested_in,
			languages_can_speak,
			country_visited,
			longitude,
			latitude,
		} = dataModal
		return (
			<Flex className={classes.bottom}>
				<Flex className={classes.bottomItem}>
					<span className={classes.title}>Summary</span>
					<CInput
						value={name}
						error={errors.name}
						placeholder="Your full name"
						prefix={<IconUserFilled />}
						onChange={(e) => onChangeData('name', e.target.value)}
					/>
					<CDatePicker
						value={birthday || null}
						error={errors.birthday}
						placeholder="Select date of member since"
						format={formatDate.dmy}
						maxDate={dayjs(Date())}
						onChange={(date, dateString) =>
							onChangeData('birthday', { date, dateString })
						}
					/>
					<Flex>
						<CSelect
							value={gender}
							error={errors.gender}
							options={genderOpts}
							placeholder="Select your gender"
							prefix={<IconGenderBigender />}
							onChange={(e) => onChangeData('gender', e)}
						/>
					</Flex>
					<CInputMap
						value={address}
						longitude={longitude}
						latitude={latitude}
						error={errors.address}
						placeholder="Enter your location"
						onSubmitModal={(value) => onChangeData('address', value)}
						prefix={<IconMapPinFilled />}
					/>
					<Flex>
						<CSelect
							value={mode}
							error={errors.mode}
							options={modOpts}
							onChange={(e) => onChangeData('mode', e)}
							prefix={<IconMoodSmileFilled />}
							placeholder="Select your state"
						/>
					</Flex>
					<CInput
						value={who_i_am}
						error={errors.who_i_am}
						placeholder="I am a/an"
						prefix={<IconUserCog />}
						onChange={(e) => onChangeData('who_i_am', e.target.value)}
					/>
					<CInput
						value={looking_for}
						error={errors.looking_for}
						placeholder="Looking for ..."
						prefix={<IconHeartPin />}
						onChange={(e) => onChangeData('looking_for', e.target.value)}
					/>
					<CInput
						value={i_can_offer}
						error={errors.i_can_offer}
						placeholder="I can offer ..."
						prefix={<IconUserHeart />}
						onChange={(e) => onChangeData('i_can_offer', e.target.value)}
					/>
				</Flex>
				<Flex className={classes.bottomItem}>
					<span className={classes.title}>Specialties</span>
					<CInput
						isRequired
						error={errors.i_am_interested_in}
						value={i_am_interested_in}
						label="Interested in"
						placeholder="Enter your interest"
						prefix={<IconHeartFilled />}
						onChange={(e) => onChangeData('i_am_interested_in', e.target.value)}
					/>
					<Flex>
						<CSelectMuti
							isRequired
							error={errors.languages_can_speak}
							value={languages_can_speak}
							label="Languages I can speak"
							placeholder="Select your languages"
							options={languageOpts}
							prefix={<IconWorld />}
							onChange={(e) => onChangeData('languages_can_speak', e)}
						/>
					</Flex>
					<CTextArea
						showCount
						isRequired
						label="Countries I've visited"
						placeholder="Enter name of countries "
						error={errors.country_visited}
						value={country_visited}
						maxLength={200}
						onChange={(e) => onChangeData('country_visited', e.target.value)}
					/>
				</Flex>
			</Flex>
		)
	}

	return (
		<>
			{open && (
				<CModal
					onClose={onClose}
					onCancel={onClose}
					title="Edit Profile"
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
								style={{ width: 240 }}
							>
								Save Change
							</CButton>
						</Flex>,
					]}
				>
					<Flex className={classes.wrapper} vertical>
						{_renderTop()}
						{_renderMiddle()}
						{_renderBottom()}
					</Flex>
				</CModal>
			)}
		</>
	)
}

export default ModalEditProfile
