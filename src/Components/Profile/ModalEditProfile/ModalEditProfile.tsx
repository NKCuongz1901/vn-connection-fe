import { IconCameraFilled, IconChevronDown } from '@tabler/icons-react'
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
	countryCodes,
	formatDate,
	genderOpts,
	languageOpts,
	levelOptions,
	modOpts,
} from '@/Variable/common.variable'

import CCheckRadio from '@/Components/Custom/CCheckRadio'
import CMultiSelect from '@/Components/Custom/CMultiSelect'
import AddIcon from '@/svg/AddIcon'
import ArmHeartIcon from '@/svg/ArmHeartIcon'
import FavoriteIcon from '@/svg/FavoriteIcon'
import GenderIcon from '@/svg/GenderIcon'
import HappyIcon from '@/svg/HappyIcon'
import Heart from '@/svg/Heart'
import MarkIcon from '@/svg/MarkIcon'
import PeopleHexagonIcon from '@/svg/PeopleHexagonIcon'
import ProfileIcon from '@/svg/ProfileIcon'
import TrashIcon from '@/svg/TrashIcon'
import WorldIcon from '@/svg/WorldIcon'
import { isArray } from '@/ultis/array.ults'
import { CountriesOptions } from '@/Variable/countryVariable'
import classes from './ModalEditProfile.module.scss'

interface ModalEditProfileProps {
	open: boolean
	onClose: any
	data?: any
	onGetUserProfile?: any
	categoryNetworkOpts?: any
	[key: string]: any
}

const ModalEditProfile = (props: ModalEditProfileProps) => {
	const { onClose, open, categoryNetworkOpts } = props
	const { loadingContext } = useLoading()
	const {
		dataModal,
		userLanguageOpts,
		errors,
		onSubmit,
		onCheckImage,
		onChangeData,
	} = useEditProfile(props)

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
					rows={4}
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
			languages_can_speak,
			country_visited,
			country_lived,
			longitude,
			latitude,
			user_languages,
			i_am_from,
			category_list,
			is_hide_age,
		} = dataModal
		return (
			<Flex className={classes.bottom}>
				<Flex className={classes.bottomItem}>
					<span className={classes.title}>Summary</span>
					<CInput
						value={name}
						error={errors.name}
						desc="If you change your name, you can’t change it again for 30 days"
						placeholder="Your full name"
						prefix={<ProfileIcon fill="#7987A4" />}
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
						<CCheckRadio
							isNoBorder
							label={'Hide age'}
							checked={!!is_hide_age}
							onClick={() => onChangeData('is_hide_age', !is_hide_age)}
						/>
					</Flex>
					<Flex>
						<CSelect
							value={gender}
							error={errors.gender}
							options={genderOpts}
							placeholder="Select your gender"
							prefix={<GenderIcon fill="#7987A4" />}
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
						prefix={<MarkIcon fill="#7987A4" />}
					/>
					<Flex>
						<CSelect
							value={mode}
							error={errors.mode}
							options={modOpts}
							onChange={(e) => onChangeData('mode', e)}
							prefix={<HappyIcon fill="#7987A4" />}
							placeholder="Select your state"
						/>
					</Flex>
					<CInput
						value={who_i_am}
						error={errors.who_i_am}
						placeholder="I am a/an"
						prefix={<PeopleHexagonIcon fill="#7987A4" />}
						onChange={(e) => onChangeData('who_i_am', e.target.value)}
					/>
					<CInput
						value={looking_for}
						error={errors.looking_for}
						placeholder="Looking for ..."
						prefix={<FavoriteIcon fill="#7987A4" />}
						onChange={(e) => onChangeData('looking_for', e.target.value)}
					/>
					<CInput
						value={i_can_offer}
						error={errors.i_can_offer}
						placeholder="I can offer ..."
						prefix={<ArmHeartIcon fill="#7987A4" />}
						onChange={(e) => onChangeData('i_can_offer', e.target.value)}
					/>
				</Flex>
				<Flex className={classes.bottomItem}>
					<Flex className={classes.title}>
						Languages I can speak <span className="error">*</span>
					</Flex>
					<Flex>
						<CSelectMuti
							isRequired
							error={errors.languages_can_speak}
							value={languages_can_speak}
							label="Native languages"
							placeholder="Select your languages"
							options={languageOpts}
							prefix={<WorldIcon fill="#7987A4" />}
							onChange={(e) => onChangeData('languages_can_speak', e)}
						/>
					</Flex>
					<Flex vertical gap={4}>
						<b>Practicing languages</b>
						<Flex vertical gap={12}>
							{user_languages.map((item, index) => {
								const { language_name, proficiency_level } = item || {}
								return (
									<>
										<Flex gap={12}>
											<CSelect
												placeholder="Language"
												options={userLanguageOpts}
												value={language_name || undefined}
												onChange={(e) =>
													onChangeData('user_languages', {
														value: e,
														index,
														id: 'language_name',
													})
												}
											/>
											<CSelect
												placeholder="Level"
												options={levelOptions}
												value={proficiency_level}
												onChange={(e) =>
													onChangeData('user_languages', {
														value: e,
														index,
														id: 'proficiency_level',
													})
												}
											/>
										</Flex>
										{!!index && (
											<Flex
												className={classes.removeBtn}
												onClick={() =>
													onChangeData('user_languages_remove', index)
												}
											>
												<TrashIcon fill="#000" />
												Remove
											</Flex>
										)}
										<div className={classes.divider} />
									</>
								)
							})}
							{!isArray(user_languages, 3) && (
								<Flex className={classes.bntAddMoreLan}>
									<CButton
										ctype="disabled"
										onClick={() => onChangeData('user_languages_add', 1)}
									>
										<AddIcon />
										Add more languages
									</CButton>
								</Flex>
							)}
						</Flex>
					</Flex>
					<span className={classes.title}>Specialties</span>
					<div>
						<CSelect
							showSearch
							isRequired
							label="I am from"
							placeholder="Enter name of countries"
							value={i_am_from || undefined}
							options={countryCodes}
							onChange={(e) => onChangeData('i_am_from', e)}
						/>
					</div>
					<div>
						<CMultiSelect
							isRequired
							suffixIcon={<IconChevronDown />}
							prefixIcon={<Heart />}
							label="Interested in"
							options={categoryNetworkOpts}
							value={category_list || []}
							error={errors.category_list}
							onChange={(e) => onChangeData('category_list', e)}
						/>
					</div>
					<Flex>
						<CSelectMuti
							isRequired
							error={errors.country_lived}
							value={country_lived}
							label="Countries I've lived in"
							placeholder="Select your languages"
							options={CountriesOptions}
							onChange={(e) => onChangeData('country_lived', e)}
						/>
					</Flex>
					<Flex>
						<CSelectMuti
							isRequired
							error={errors.country_visited}
							value={country_visited}
							label="Countries I've visited"
							placeholder="Select your languages"
							options={CountriesOptions}
							onChange={(e) => onChangeData('country_visited', e)}
						/>
					</Flex>
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
