import { Flex, Skeleton } from 'antd'
import { forwardRef } from 'react'

import useHangoutTabOpen from '@/hooks/Hangout/useHangoutTabOpen'

import { arrayFrom, isArray } from '@/ultis/array'

import CButton from '@/Components/Custom/CButton'
import CSelect from '@/Components/Custom/CSelect'
import NoHangout from '@/svg/Hangout/NoHangout'
import ItemHangout from '../ItemHangout'

import { radiusOpts } from '@/Variable/select.variable'

import classes from './HangoutTabOpen.module.scss'

function HangoutTabOpen(props, ref) {
	const {
		loadMore,
		total,
		hangoutList,
		loading,
		radius,
		setRadius,
		setTotal,
		setOpenHangoutList,
		setOpenHangoutSearch,
		onLoadMore,
	} = useHangoutTabOpen(ref)
	const { open, search } = total

	const _renderNoHangout = () => {
		if (loading.open || loading.search) return
		return (
			<Flex className={classes.noHangout} vertical>
				<NoHangout />
				<div className={classes.titleNoHangout}>No hangouts nearby</div>
				<div className={classes.textNoHangout}>
					{'Please try again later or\u000Aexpand your search distance'}
				</div>
			</Flex>
		)
	}

	return (
		<div className={classes.wrapper}>
			<Flex className={classes.infoPeople}>
				<Flex className={classes.people}>
					<span className={classes.number}>{open + search}</span>
					<span className={classes.title}>people hangouts</span>
				</Flex>
				<Flex className={classes.radius}>
					<CSelect
						value={radius}
						options={radiusOpts}
						onChange={(e) => setRadius(e)}
					/>
				</Flex>
			</Flex>
			<Flex className={classes.hangoutWrapper}>
				{isArray(hangoutList, 1)
					? hangoutList.map((item) => (
							<ItemHangout
								key={item.id}
								item={item}
								setOpenHangoutList={setOpenHangoutList}
								setOpenHangoutSearch={setOpenHangoutSearch}
								setTotal={setTotal}
							/>
					  ))
					: _renderNoHangout()}

				{loading.open || loading.search
					? arrayFrom(3).map((_, index) => (
							<Skeleton.Input key={index} active className={classes.skeleton} />
					  ))
					: (loadMore.open || loadMore.search) && (
							<Flex className={classes.loadmore}>
								<CButton ctype="oranger" onClick={onLoadMore}>
									Load more
								</CButton>
							</Flex>
					  )}
			</Flex>
		</div>
	)
}

export default forwardRef(HangoutTabOpen)
