import { SearchOutlined } from '@ant-design/icons'
import { IconChevronDown, IconChevronLeft } from '@tabler/icons-react'
import { Flex, Popover, Skeleton } from 'antd'
import { memo } from 'react'

import useLocal from '@/hooks/Search/useLocal'

import { arrayFrom, isArray } from '@/ultis/array'
import { useLocalePath } from '@/ultis/route'

import CAvatar from '@/Components/Custom/CAvatar'
import CButton from '@/Components/Custom/CButton'
import CCheckbox from '@/Components/Custom/CCheckbox'
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
import { genderOpts } from '@/Variable/common.variable'
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

const Local = (props: LocalProps) => {
	const { onChangeRoute } = useLocalePath()
	const {
		_loadmore,
		loading,
		user,
		total,
		filter,
		tabsData,
		shows,
		setShows,
		onChangeValue,
		onToggleLanguage,
		onToggleHobby,
		onScroll,
		onLoadMore,
		onSearch,
	} = useLocal(props)
	const { data } = props || {}
	const { address } = data || {}
	const _renderFilterGroup = () => {
		const { age_range, gender_array, radius } = filter
		return (
			<div className={classes.filterGroupWrapper}>
				<Flex className={classes.filterGroupContainer} vertical>
					<Flex className={classes.genderWrapper} vertical>
						<div className={classes.title}>Gender</div>
						<Flex className={classes.genders}>
							{genderOpts.map((i) => (
								<div key={i.value} className={classes.gender}>
									<CCheckbox
										checked={gender_array.includes(i.value)}
										onChange={() => onChangeValue('gender')(i.value)}
									>
										{i.label}
									</CCheckbox>
								</div>
							))}
						</Flex>
					</Flex>
					<Flex className={classes.ageWrapper} vertical>
						<div className={classes.title}>Age Range</div>
						<div>
							<CSliderRanger
								showIcon
								range
								step={1}
								max={81}
								min={18}
								value={age_range}
								marks={{ 18: 18, 81: '+80' }}
								onChange={onChangeValue('age')}
							/>
						</div>
					</Flex>
					<Flex className={classes.distanceWrapper} vertical>
						<div className={classes.title}>Distance</div>
						<CSelect
							value={radius}
							placeholder="Choose distance"
							options={radiusOpts}
							onChange={onChangeValue('distance')}
						/>
					</Flex>

					<Flex className={classes.filterButton}>
						<CButton ctype="disabled" onClick={onChangeValue('reset')}>
							Reset
						</CButton>
						<CButton ctype="oranger" onClick={onSearch}>
							Show
						</CButton>
					</Flex>
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
