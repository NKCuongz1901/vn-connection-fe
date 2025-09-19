import { SearchOutlined } from '@ant-design/icons'
import { IconChevronLeft } from '@tabler/icons-react'
import { Flex, Skeleton } from 'antd'
import { memo } from 'react'

import useSocialEvent from '@/hooks/Search/useSocialEvent'

import { arrayFrom, isArray } from '@/ultis/array.ults'
import { useLocalePath } from '@/ultis/route.ults'

import CButton from '@/Components/Custom/CButton'
import CDatePickerRanger from '@/Components/Custom/CDatePickerRanger'
import CInput from '@/Components/Custom/CInput'
import CSelect from '@/Components/Custom/CSelect'
import ItemEvent from '@/Components/Event/ItemEvent'
import MarkIcon from '@/svg/MarkIcon'
import NotFound from '@/svg/NotFound'
import UpcomingEvent from '@/svg/UpcomingEvent'

import { radiusOpts } from '@/Variable/select.variable'
import { mainRoutes } from '@/routes/MainRoutes'

import classes from './SocialEvent.module.scss'

interface EventInAppProps {
	data: {
		longitude: number | string
		latitude: number | string
	}
	[key: string]: any
}
const Local = (props: EventInAppProps) => {
	const { onChangeRoute } = useLocalePath()
	const {
		_loadmore,
		loading,
		event,
		total,
		filter,
		onChangeValue,
		onScroll,
		onLoadMore,
	} = useSocialEvent(props)

	const _renderFilter = () => {
		const { keyword, radius, date } = filter
		return (
			<Flex className={classes.filter}>
				<div className={classes.filterSearch}>
					<CInput
						disabled={loading}
						placeholder="Location by city, district"
						style={{ borderRadius: 40, height: 40 }}
						prefix={<SearchOutlined className={classes.filterSearchIcon} />}
						onChange={onChangeValue('keyword')}
						value={keyword}
					/>
				</div>
				<Flex className={classes.distance}>
					<CSelect
						disabled={loading}
						value={radius}
						options={radiusOpts}
						placeholder="Choose distance"
						prefix={<MarkIcon />}
						onChange={onChangeValue('radius')}
					/>
				</Flex>
				<Flex className={classes.date}>
					<CDatePickerRanger
						disabled={loading}
						value={date}
						onChange={onChangeValue('date')}
					/>
				</Flex>
			</Flex>
		)
	}
	const _renderSkeleton = (index) => {
		return (
			<Flex key={index} vertical className={classes.skeleton}>
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
	const _renderEventList = () => {
		if (!loading && !isArray(event, 1)) return _renderNoResultFound()
		return (
			<Flex className={classes.eventList} onScroll={onScroll}>
				{event.map((item) => {
					const { id } = item || {}
					return (
						<Flex key={id} vertical className={classes.event}>
							<ItemEvent data={item} type={mainRoutes.upcomingEvent} />
						</Flex>
					)
				})}
				{loading && arrayFrom(6).map((_, index) => _renderSkeleton(index))}
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
					<UpcomingEvent fill="#1E9037" />
					<div className={classes.headerLabel}>Social Events </div>
					<Flex className={classes.totalEvent}>{total.event}</Flex>
				</Flex>
				{_renderFilter()}
				{_renderEventList()}
			</Flex>
		</div>
	)
}

export default memo(Local)
