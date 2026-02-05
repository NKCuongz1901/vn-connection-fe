import { CalendarFilled, SearchOutlined } from '@ant-design/icons'
import { IconChevronDown, IconChevronLeft } from '@tabler/icons-react'
import { Flex, Popover, Skeleton } from 'antd'
import { memo } from 'react'

import useLocal from '@/hooks/Search/useLocal'

import { arrayFrom, isArray } from '@/ultis/array.ults'
import { useLocalePath } from '@/ultis/route.ults'

import CAvatar from '@/Components/Custom/CAvatar'
import CButton from '@/Components/Custom/CButton'
import CCheckbox from '@/Components/Custom/CCheckbox'
import CInput from '@/Components/Custom/CInput'
import CSelect from '@/Components/Custom/CSelect'
import CSliderRanger from '@/Components/Custom/CSliderRanger/CSliderRanger'
import FilterIcon from '@/svg/FilterIcon'
import NotFound from '@/svg/NotFound'
import ProfileIcon from '@/svg/ProfileIcon'

import { genderOpts } from '@/Variable/common.variable'
import { languages, radiusOpts } from '@/Variable/select.variable'
import { mainRoutes } from '@/routes/MainRoutes'

import classes from './Local.module.scss'
import clsx from 'clsx'
import DotIcon from '@/svg/DotIcon'
import MaleIcon from '@/svg/MaleIcon'
import FeMaleIcon from '@/svg/FeMaleIcon'
import GenderIcon from '@/svg/GenderIcon'
import { LEFT_FLAG, mappingFlag } from '@/Variable/countryVariable'

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
const Local = (props: LocalProps) => {
	const { onChangeRoute } = useLocalePath()
	const {
		_loadmore,
		loading,
		user,
		total,
		filter,
		shows,
		setShows,
		onChangeValue,
		onScroll,
		onLoadMore,
		onSearch,
	} = useLocal(props)

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
			<div className={classes.filterGroupWrapper}>
				<Flex className={classes.filterGroupContainer} vertical>
					<Flex className={classes.genderWrapper} vertical>
						<div className={classes.title}>Languages</div>
						<Flex className={classes.genders} vertical>
							{languages.map((i) => (
								<div key={i.value} className={classes.gender}>
									<CCheckbox
										checked={languages_can_speak_array.includes(i.value)}
										onChange={() => onChangeValue('language')(i.value)}
									>
										{i.label}
									</CCheckbox>
								</div>
							))}
						</Flex>
					</Flex>
					<Flex className={classes.filterButton}>
						<CButton ctype="disabled" onClick={onChangeValue('resetLanguage')}>
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
	const _renderFilter = () => {
		return (
			<Flex className={classes.filter}>
				<div className={classes.filterSearch}>
					<CInput
						placeholder="Search by keyword"
						style={{ borderRadius: 40, height: 40 }}
						prefix={<SearchOutlined className={classes.filterSearchIcon} />}
						onChange={onChangeValue('keyword')}
						value={filter.keyword}
					/>
				</div>
				<Popover
					placement="bottom"
					trigger="click"
					open={shows.filter}
					onOpenChange={() =>
						setShows((prev) => ({ ...prev, filter: !prev.filter }))
					}
					content={_renderFilterGroup}
				>
					<Flex className={classes.filterGroup}>
						<Flex align="center" gap={12}>
							<div className={classes.filterIcon}>
								<FilterIcon />
							</div>
							<div>Filter</div>
						</Flex>
						<IconChevronDown />
					</Flex>
				</Popover>
				<Popover
					placement="bottom"
					trigger="click"
					open={shows.language}
					onOpenChange={() =>
						setShows((prev) => ({ ...prev, language: !prev.language }))
					}
					content={_renderFilterLanguage}
				>
					<Flex className={classes.filterGroup}>
						<Flex align="center" gap={12}>
							<div className={classes.filterIcon}>
								<CalendarFilled style={{ color: 'white' }} />
							</div>
							<div>Languages</div>
						</Flex>
						<IconChevronDown />
					</Flex>
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
					const { id, avatar, name, i_am_from, country_code, age, gender } =
						item || {}
					const IconGender = genderIcon[gender]
					return (
						<Flex key={id} vertical className={classes.user}>
							<Flex className={classes.userAvatarWrapper}>
								<CAvatar
									src={avatar}
									className={classes.userAvatar}
									onClick={() => onChangeRoute(`${mainRoutes.profile}/${id}`)}
								/>

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
					<div className={classes.headerLabel}>Locals and Expats</div>
					<Flex className={classes.totalUser}>{total.user}</Flex>
				</Flex>
				{_renderFilter()}
				{_renderUserList()}
			</Flex>
		</div>
	)
}

export default memo(Local)
