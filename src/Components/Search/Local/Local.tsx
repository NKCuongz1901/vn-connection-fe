import { SearchOutlined } from '@ant-design/icons'
import { IconChevronDown, IconChevronLeft } from '@tabler/icons-react'
import { Flex, Popover, Skeleton } from 'antd'
import { memo } from 'react'

import useLocal from '@/hooks/Search/useLocal'

import { arrayFrom, isArray } from '@/ultis/array'
import { useLocalePath } from '@/ultis/route'

import CAvatar from '@/Components/Custom/CAvatar'
import CButton from '@/Components/Custom/CButton'
import CInput from '@/Components/Custom/CInput'
import CInterestTagPicker, {
	interestTagPickerClasses,
} from '@/Components/Custom/CInterestTagPicker'
import CSelectionItem from '@/Components/Custom/CSelectionItem'
import CSelectionPicker, {
	selectionPickerClasses,
} from '@/Components/Custom/CSelectionPicker'
import CSelect from '@/Components/Custom/CSelect'
import CSliderRanger from '@/Components/Custom/CSliderRanger/CSliderRanger'
import FilterIcon from '@/svg/FilterIcon'
import HappyIcon from '@/svg/HappyIcon'
import NotFound from '@/svg/NotFound'
import ProfileIcon from '@/svg/ProfileIcon'

import { mainRoutes } from '@/routes/MainRoutes'
import { genderOpts, countryCodes } from '@/Variable/common.variable'
import { languages, radiusOpts } from '@/Variable/select.variable'

import DotIcon from '@/svg/DotIcon'
import FeMaleIcon from '@/svg/FeMaleIcon'
import GenderIcon from '@/svg/GenderIcon'
import MaleIcon from '@/svg/MaleIcon'
import LanguageIcon from '@/svg/LanguageIcon'
import { LEFT_FLAG, mappingFlag } from '@/Variable/countryVariable'
import clsx from 'clsx'
import classes from './Local.module.scss'
import { formatLastOnlineShort } from '@/ultis/date'

const genderIcon = {
	MALE: MaleIcon,
	FEMALE: FeMaleIcon,
	OTHER: GenderIcon,
}
interface LocalProps {
	data: {
		longitude?: number | string
		latitude?: number | string
		address?: string
	}
	[key: string]: any
}

const getSelectedLabels = (
	values: string[],
	options: { value: string; label: string }[],
	fallback: string,
) => {
	if (!isArray(values, 1)) return fallback
	return options
		.filter((item) => values.includes(item.value))
		.map((item) => item.label)
		.join(', ')
}

const filterRadiusOpts = radiusOpts.filter((item) =>
	[2, 5, 10, 20].includes(Number(item.value)),
)

const filterGenderOpts = genderOpts.map((item) =>
	item.value === 'OTHER' ? { ...item, label: 'All' } : item,
)

const nationalityOptions = countryCodes.map((item) => ({
	value: item.code,
	label: item.name,
	name: item.name,
}))

const Local = (props: LocalProps) => {
	const { onChangeRoute } = useLocalePath()
	const {
		_loadmore,
		loading,
		user,
		total,
		filter,
		draftFilter,
		tabsData,
		shows,
		setShows,
		initDraftFilter,
		onChangeValue,
		onChangeDraftValue,
		onToggleLanguage,
		onToggleHobby,
		onScroll,
		onLoadMore,
		onApplyFilter,
	} = useLocal(props)
	const { data } = props || {}
	const { address } = data || {}
	const _renderFilterGroup = () => {
		const {
			age_range,
			gender_array,
			radius,
			languages_can_speak_array,
			nationality,
			interest,
		} = draftFilter
		const filterLanguageLabel = getSelectedLabels(
			languages_can_speak_array,
			languages,
			'Select languages',
		)
		const selectedNationalityCode = nationality?.[0]

		return (
			<div className={classes.filterPanelWrapper}>
				<div className={classes.filterPanelContent}>
				<Flex className={classes.filterSection} vertical>
					<div className={classes.sectionTitle}>Gender</div>
					<Flex className={classes.radioRow}>
						{filterGenderOpts.map((item) => (
							<label key={item.value} className={classes.radioItem}>
								<span
									className={clsx(classes.radioCircle, {
										[classes.radioCircleActive]:
											gender_array.includes(item.value),
									})}
								/>
								<span className={classes.radioLabel}>{item.label}</span>
								<input
									type="checkbox"
									className={classes.radioInput}
									checked={gender_array.includes(item.value)}
									onChange={() => onChangeDraftValue('gender')(item.value)}
								/>
							</label>
						))}
					</Flex>
				</Flex>

				<Flex className={classes.filterSection} vertical>
					<div className={classes.sectionTitle}>Age Range</div>
					<CSliderRanger
						showIcon
						range
						step={1}
						max={81}
						min={18}
						value={age_range}
						marks={{ 18: 18, 81: '+80' }}
						onChange={onChangeDraftValue('age')}
					/>
				</Flex>

				<Flex className={classes.filterSection} vertical>
					<div className={classes.sectionTitle}>Distance</div>
					<Flex className={classes.distanceGrid} vertical gap={8}>
						{[0, 1].map((row) => (
							<Flex key={row} className={classes.radioRow}>
								{filterRadiusOpts.slice(row * 2, row * 2 + 2).map((item) => (
									<label key={item.value} className={classes.radioItem}>
										<span
											className={clsx(classes.radioCircle, {
												[classes.radioCircleActive]: radius === item.value,
											})}
										/>
										<span className={classes.radioLabel}>{item.label}</span>
										<input
											type="radio"
											name="local-filter-radius"
											className={classes.radioInput}
											checked={radius === item.value}
											onChange={() =>
												onChangeDraftValue('radiusOption')(item.value)
											}
										/>
									</label>
								))}
							</Flex>
						))}
					</Flex>
				</Flex>

				<Flex className={classes.filterSection} vertical>
					<div className={classes.fieldLabel}>Languages</div>
					<Popover
						trigger="click"
						placement="bottomLeft"
						overlayClassName={selectionPickerClasses.popover}
						arrow={false}
						content={
							<CSelectionPicker title="Choose languages">
								{languages.map((item) => (
									<CSelectionItem
										key={item.value}
										label={item.label}
										checked={languages_can_speak_array.includes(
											item.value,
										)}
										onClick={() => onChangeDraftValue('language')(item.value)}
									/>
								))}
							</CSelectionPicker>
						}
					>
						<div className={classes.filterDropdownWrap}>
							<button type="button" className={classes.filterDropdown}>
							<span
								className={clsx(classes.filterDropdownText, {
									[classes.filterDropdownPlaceholder]:
										!isArray(languages_can_speak_array, 1),
								})}
							>
								{filterLanguageLabel}
							</span>
							<IconChevronDown size={20} className={classes.filterDropdownIcon} />
							</button>
						</div>
					</Popover>
				</Flex>

				<Flex className={classes.filterSection} vertical>
					<div className={classes.sectionTitle}>Nationality</div>
					<CSelect
						className={classes.filterSelectNationality}
						showSearch
						allowClear
						placeholder="Select nationality"
						options={nationalityOptions}
						value={selectedNationalityCode || undefined}
						bordered={false}
						style={{ width: '100%' }}
						prefix={
							selectedNationalityCode ? (
								<span
									className={clsx(
										`flag:${mappingFlag[selectedNationalityCode] || selectedNationalityCode}`,
										classes.nationalityFlag,
									)}
								/>
							) : null
						}
						optionRender={(option) => (
							<Flex align="center" gap={8}>
								<span
									className={clsx(
										`flag:${mappingFlag[option.value as string] || option.value}`,
										classes.nationalityFlag,
									)}
								/>
								<span>{option.label}</span>
							</Flex>
						)}
						filterOption={(input, option) =>
							(option?.name as string)
								?.toLowerCase()
								.includes(input.toLowerCase())
						}
						onChange={onChangeDraftValue('nationality')}
					/>
				</Flex>

				<Flex className={classes.filterSection} vertical>
					<div className={classes.sectionTitle}>Interest</div>
					<CInterestTagPicker
						items={tabsData}
						selected={interest}
						listClassName={classes.filterInterestTags}
						onToggle={(id) => onChangeDraftValue('hobby')(id)}
					/>
				</Flex>
				</div>

				<Flex className={classes.filterPanelFooter}>
					<div className={classes.filterFooterBtn}>
						<CButton ctype="disabled" onClick={onChangeDraftValue('reset')}>
							Reset
						</CButton>
					</div>
					<div className={classes.filterFooterBtn}>
						<CButton ctype="oranger" onClick={onApplyFilter}>
							Show results
						</CButton>
					</div>
				</Flex>
			</div>
		)
	}
	const _renderFilterLanguage = () => {
		const { languages_can_speak_array } = filter

		return (
			<CSelectionPicker title="Choose languages">
				{languages.map((item) => (
					<CSelectionItem
						key={item.value}
						label={item.label}
						checked={languages_can_speak_array.includes(item.value)}
						onClick={() => onToggleLanguage(item.value)}
					/>
				))}
			</CSelectionPicker>
		)
	}
	const _renderFilterHobbies = () => {
		const { interest } = filter

		return (
			<div className={interestTagPickerClasses.picker}>
				<CInterestTagPicker
					items={tabsData}
					selected={interest}
					onToggle={onToggleHobby}
				/>
			</div>
		)
	}
	const _renderFilter = () => {
		const { languages_can_speak_array, interest } = filter
		const interestOptions = tabsData.map((item) => ({
			value: item.id,
			label: item.title,
		}))
		const languageLabel = getSelectedLabels(
			languages_can_speak_array,
			languages,
			'Languages',
		)
		const hobbiesLabel = getSelectedLabels(interest, interestOptions, 'Hobbies')

		const togglePopover =
			(key: 'filter' | 'language' | 'hobbies') => (open: boolean) => {
				if (key === 'filter' && open) {
					initDraftFilter()
				}
				setShows({
					filter: key === 'filter' ? open : false,
					language: key === 'language' ? open : false,
					hobbies: key === 'hobbies' ? open : false,
				})
			}

		return (
			<Flex className={classes.filter}>
				<div className={classes.filterSearch}>
					<CInput
						className={classes.searchInput}
						placeholder="Search by keyword"
						value={filter.keyword}
						isNotBold
						allowClear={false}
						bordered={false}
						prefix={<SearchOutlined className={classes.filterSearchIcon} />}
						onChange={onChangeValue('keyword')}
					/>
				</div>
				<Popover
					placement="bottomLeft"
					trigger="click"
					open={shows.language}
					onOpenChange={togglePopover('language')}
					content={_renderFilterLanguage}
					overlayClassName={selectionPickerClasses.popover}
					arrow={false}
				>
					<Flex className={classes.filterPill}>
						<div className={classes.filterPillIcon}>
							<LanguageIcon width={16} height={16} />
						</div>
						<div className={classes.filterPillLabel}>{languageLabel}</div>
						<IconChevronDown size={16} className={classes.filterPillChevron} />
					</Flex>
				</Popover>
				<Popover
					placement="bottomLeft"
					trigger="click"
					open={shows.hobbies}
					onOpenChange={togglePopover('hobbies')}
					content={_renderFilterHobbies}
					overlayClassName={interestTagPickerClasses.popover}
					arrow={false}
				>
					<Flex className={classes.filterPill}>
						<div className={classes.filterPillIcon}>
							<HappyIcon fill="#fff" width={16} height={16} />
						</div>
						<div className={classes.filterPillLabel}>{hobbiesLabel}</div>
						<IconChevronDown size={16} className={classes.filterPillChevron} />
					</Flex>
				</Popover>
				<Popover
					placement="bottomLeft"
					trigger="click"
					open={shows.filter}
					onOpenChange={togglePopover('filter')}
					content={_renderFilterGroup}
					overlayClassName={classes.filterPopover}
					arrow={false}
				>
					<button type="button" className={classes.filterAction}>
						<FilterIcon fill="#7987A4" width={24} height={24} />
					</button>
				</Popover>
			</Flex>
		)
	}
	const _renderSkeleton = (index) => {
		return (
			<Flex key={index} vertical className={classes.skeleton}>
				<Skeleton.Avatar active className={classes.skeletonAva} />
				<Skeleton.Input active className={classes.skeletonLabel} />
			</Flex>
		)
	}
	const _renderNoResultFound = () => {
		return (
			<Flex className={classes.notFound} vertical>
				<NotFound />
				<div className={classes.title}>No results found</div>
				<div className={classes.label}>
					Try extending distance or different filter
				</div>
			</Flex>
		)
	}
	const _renderUserList = () => {
		if (!loading && !isArray(user, 1)) return _renderNoResultFound()
		return (
			<Flex className={classes.userList} onScroll={onScroll}>
				{user.map((item) => {
					const {
						id,
						avatar,
						name,
						i_am_from,
						country_code,
						age,
						gender,
						visibility,
						online_time,
					} = item || {}
					const IconGender = genderIcon[gender]
					const isOnline = visibility === 'ONLINE'

					return (
						<Flex key={id} vertical className={classes.user}>
							<Flex className={classes.userAvatarWrapper}>
								<div className={classes.avatarWrap}>
									<CAvatar
										src={avatar}
										className={classes.userAvatar}
										onClick={() => onChangeRoute(`${mainRoutes.profile}/${id}`)}
									/>
									{!isOnline && online_time && (
										<span className={classes.lastSeen}>
											{formatLastOnlineShort(online_time)}
										</span>
									)}
								</div>

								<div className={classes.flagWrapper}>
									<div
										className={clsx(
											`flag:${mappingFlag[i_am_from || country_code] || i_am_from || country_code}`,
											classes.flag,
											{
												[classes.leftFlag]:
													!!LEFT_FLAG[i_am_from || country_code],
											},
										)}
									/>
								</div>
							</Flex>
							<Flex
								align="center"
								justify="center"
								gap={4}
								className={classes.userNameRow}
							>
								{isOnline && (
									<span className={classes.onlineDot} aria-label="Online" />
								)}
								<div className={classes.userName}>{name}</div>
							</Flex>
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
											[classes.iconGender]: gender === 'OTHER',
										})}
									>
										<IconGender
											{...(gender === 'OTHER' && { fill: '#7987A4' })}
										/>
									</div>
								)}
							</Flex>
						</Flex>
					)
				})}
				{loading && arrayFrom(7).map((_, index) => _renderSkeleton(index))}
				{!loading && _loadmore.current && (
					<Flex className={classes.loadmore}>
						<CButton ctype="oranger" onClick={onLoadMore}>
							Load more
						</CButton>
					</Flex>
				)}
			</Flex>
		)
	}
	return (
		<div className={classes.wrapper}>
			<Flex vertical className={classes.container}>
				<Flex className={classes.header}>
					<IconChevronLeft
						className={classes.iconHeader}
						onClick={() => onChangeRoute(mainRoutes.search)}
					/>
					<ProfileIcon />
					<div className={classes.headerLabel}>
						Locals and Expats {address ? `in ${address}` : ''}
					</div>
					<Flex className={classes.totalUser}>{total.user}</Flex>
				</Flex>
				{_renderFilter()}
				{_renderUserList()}
			</Flex>
		</div>
	)
}

export default memo(Local)
