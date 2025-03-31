import {
	IconCameraFilled,
	IconGenderBigender,
	IconHeartFilled,
	IconMapPinFilled,
	IconMoodSmileFilled,
	IconUserFilled,
	IconWorld,
} from '@tabler/icons-react'
import { Flex, Image } from 'antd'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'

import { cloneDeep, toJson } from '@/ultis/common.ults'

import CAvatar from '@/Components/Custom/CAvatar'
import CButton from '@/Components/Custom/CButton'
import CDatePicker from '@/Components/Custom/CDatePicker'
import CInput from '@/Components/Custom/CInput'
import CModal from '@/Components/Custom/CModal/CModal'
import CSelect from '@/Components/Custom/CSelect'
import CSelectMuti from '@/Components/Custom/CSelectMuti'
import CTextArea from '@/Components/Custom/CTextArea'

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
	[key: string]: any
}
const handleParseToData = (data) => {
	const {
		avatar,
		cover,
		about_me,
		name,
		address,
		birthday,
		gender,
		mode,
		i_am_interested_in,
		languages_can_speak_array,
		country_visited,
	} = cloneDeep(data)
	const returnData = {
		avatar,
		cover,
		about_me,
		name,
		address,
		birthday: birthday ? dayjs(birthday) : null,
		gender: genderOpts.find((i) => i.value === gender),
		mode: modOpts.find((i) => i.value === mode),
		i_am_interested_in,
		languages_can_speak: languages_can_speak_array,
		country_visited,
	}
	return returnData
}

const ModalEditProfile = (props: ModalEditProfileProps) => {
	const { onClose, open, data } = props
	const [dataModal, setDataModal] = useState(handleParseToData(data))
	const [errors, setErrors] = useState({
		about_me: '',
		i_am_interested_in: '',
		languages_can_speak: '',
		country_visited: '',
	})
	const handleChangeData = (key, _value) => {
		let value = _value
		switch (key) {
			case 'birthday':
				value = _value?.date
				break
			default:
				break
		}
		setErrors((prev) => ({ ...prev, [key]: '' }))
		setDataModal((prev) => ({ ...prev, [key]: value }))
	}
	useEffect(() => {
		const _data = handleParseToData(data)
		setDataModal(_data)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toJson(data)])
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
						<IconCameraFilled className={classes.iconCamera} />
					</Flex>
				</Flex>
				<Flex className={classes.avatarWrapper}>
					<Flex className={classes.avatar}>
						<CAvatar src={avatar} size={96} />
						<Flex className={classes.camera}>
							<IconCameraFilled className={classes.iconCamera} />
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
					onChange={(e) => handleChangeData('about_me', e.target.value)}
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
			i_am_interested_in,
			languages_can_speak,
			country_visited,
		} = dataModal
		return (
			<Flex className={classes.bottom}>
				<Flex className={classes.bottomItem}>
					<span className={classes.title}>Summary</span>
					<CInput
						value={name}
						placeholder="Your full name"
						prefix={<IconUserFilled />}
						onChange={(e) => handleChangeData('name', e.target.value)}
					/>
					<CDatePicker
						value={birthday || ''}
						placeholder="Select date of member since"
						format={formatDate.dmy}
						onChange={(date, dateString) =>
							handleChangeData('birthday', { date, dateString })
						}
					/>
					<Flex style={{ height: 44 }}>
						<CSelect
							value={gender}
							options={genderOpts}
							placeholder="Select your gender"
							prefix={<IconGenderBigender />}
							onChange={(e) => handleChangeData('gender', e)}
						/>
					</Flex>
					<CInput
						value={address}
						onChange={(e) => handleChangeData('address', e.target.value)}
						prefix={<IconMapPinFilled />}
						placeholder="Enter your location"
					/>
					<Flex style={{ height: 44 }}>
						<CSelect
							value={mode}
							options={modOpts}
							prefix={<IconMoodSmileFilled />}
							placeholder="Select your state"
						/>
					</Flex>
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
						onChange={(e) =>
							handleChangeData('i_am_interested_in', e.target.value)
						}
					/>
					<Flex style={{ height: 70 }}>
						<CSelectMuti
							isRequired
							error={errors.languages_can_speak}
							value={languages_can_speak}
							label="Languages I can speak"
							placeholder="Select your languages"
							options={languageOpts}
							prefix={<IconWorld />}
							onChange={(e) => handleChangeData('languages_can_speak', e)}
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
						onChange={(e) =>
							handleChangeData('country_visited', e.target.value)
						}
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
								onClick={onClose}
								ctype="disabled"
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
