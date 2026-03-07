'use client'

import { Flex, Skeleton } from 'antd'
import { forwardRef } from 'react'

import useHangoutTabMy from '@/hooks/Hangout/useHangoutTabMy'

import { arrayFrom } from '@/ultis/array'

import CButton from '@/Components/Custom/CButton'
import ItemHangout from '../ItemHangout'

import classes from './HangoutTabMy.module.scss'
function HangoutTabMy(props, ref) {
	const { onClick } = props
	const { TabsData, loading, loadMore, onLoadMore } = useHangoutTabMy(ref)

	const _renderTabData = ({ id, label, data }) => {
		return (
			<div key={id} className={classes.tabContent}>
				<Flex className={classes.infoPeople}>
					<Flex className={classes.people}>
						<span className={classes.title}>{label}</span>
						<span className={classes.number}>{data?.length || 0}</span>
					</Flex>
				</Flex>
				<Flex className={classes.hangoutWrapper}>
					{data.map((item) => (
						<ItemHangout
							isHiddenButton
							item={item}
							key={item.id}
							onClick={() => onClick(item.id)}
						/>
					))}
					{loading[id]
						? arrayFrom(3).map((_, index) => (
								<Skeleton.Input
									key={index}
									active
									className={classes.skeleton}
								/>
						  ))
						: loadMore.current[id] && (
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

	return <div className={classes.wrapper}>{TabsData.map(_renderTabData)}</div>
}

export default forwardRef(HangoutTabMy)
