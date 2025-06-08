import { forwardRef } from 'react'

import CButton from '@/Components/Custom/CButton'
import CSelect from '@/Components/Custom/CSelect'
import { radiusOpts } from '@/Variable/select.variable'
import useHangoutTabOpen from '@/hooks/Hangout/useHangoutTabOpen'
import { arrayFrom } from '@/ultis/array.ults'
import { Flex, Skeleton } from 'antd'
import ItemHangout from '../ItemHangout'
import classes from './HangoutTabOpen.module.scss'
function HangoutTabOpen(props, ref) {
	const {
		loadMore,
		total,
		hangoutList,
		loading,
		setOpenHangoutList,
		setOpenHangoutSearch,
		onLoadMore,
	} = useHangoutTabOpen(ref)
	const { open, search } = total

	return (
		<div className={classes.wrapper}>
			<Flex className={classes.infoPeople}>
				<Flex className={classes.people}>
					<span className={classes.number}>{open + search}</span>
					<span className={classes.title}>people hangouts</span>
				</Flex>
				<Flex className={classes.radius}>
					<CSelect value={10} options={radiusOpts} />
				</Flex>
			</Flex>
			<Flex className={classes.hangoutWrapper}>
				{hangoutList.map((item) => (
					<ItemHangout
						key={item.id}
						item={item}
						setOpenHangoutList={setOpenHangoutList}
						setOpenHangoutSearch={setOpenHangoutSearch}
					/>
				))}
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
