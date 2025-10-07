import { Flex, Popover } from 'antd'
import clsx from 'clsx'
import React, { memo, useCallback, useState } from 'react'

import { isArray } from '@/ultis/array.ults'

import CButton from '../CButton'
import CImage from '../CImage'

import { CategoriFavOptProps } from '@/interface/Community/Community.interface'

import classes from './CMultiSelect.module.scss'
interface CMultiSelectProps {
	label?: string
	isRequired?: boolean
	value: CategoriFavOptProps[]
	options: CategoriFavOptProps[]
	max?: number
	error?: string
	suffixIcon?: React.ReactNode
	onChange?: any
	[key: string]: any
}

const CMultiSelect = (props: CMultiSelectProps) => {
	const {
		isRequired,
		label,
		value,
		error,
		suffixIcon,
		options,
		max,
		onChange,
	} = props
	const [shows, setShows] = useState(false)
	const [choose, setChoose] = useState<CategoriFavOptProps[]>([])
	const handleChoose = useCallback(
		(data: CategoriFavOptProps) => {
			setChoose((prev) => {
				if (prev.some((i) => i.id === data.id)) {
					return prev.filter((i) => i.id !== data.id)
				} else {
					if (max && isArray(prev, max)) {
						return prev
					} else {
						return [...prev, data]
					}
				}
			})
		},
		[max],
	)
	const toggle = (val) => {
		if (!val) {
			setChoose(value || [])
		}
		setShows(val)
	}
	const _renderChooseCatogory = () => {
		return (
			<div className={classes.chooseCatogoryWrapper}>
				<Flex className={classes.chooseCatogoryContainer}>
					<Flex className={classes.chooseContent}>
						{(options || []).map((opt) => {
							const { id, title, image } = opt || {}
							return (
								<Flex
									key={id}
									className={clsx(classes.chooseItem, {
										[classes.active]: choose.some((i) => i.id === id),
									})}
									vertical
									onClick={() => handleChoose(opt)}
								>
									<div className={classes.chooseItemImg}>
										<CImage src={image} />
									</div>
									<div className={classes.chooseItemLabel}>{title}</div>
								</Flex>
							)
						})}
					</Flex>
					<Flex className={classes.button}>
						<CButton
							ctype="oranger"
							onClick={() => {
								if (onChange) {
									onChange(choose)
								}
								setShows(false)
							}}
						>
							Set community interests
						</CButton>
					</Flex>
				</Flex>
			</div>
		)
	}
	return (
		<div className={classes.wrapper}>
			<Flex vertical className={classes.container}>
				{label && (
					<span className="bold">
						{label} {isRequired && <span className="error">*</span>}
					</span>
				)}
				<Popover
					placement="bottom"
					trigger="click"
					open={shows}
					onOpenChange={toggle}
					content={_renderChooseCatogory}
				>
					<Flex className={clsx(classes.content, { [classes.error]: !!error })}>
						<div
							className={clsx({
								[classes.opacityDown]: !isArray(choose, 1),
							})}
						>
							{isArray(choose, 1)
								? (choose || []).map((i) => i.title).join(', ')
								: 'Which category fits you best?'}
						</div>
						{suffixIcon && (
							<div className={classes.suffixIcon}>{suffixIcon}</div>
						)}
					</Flex>
				</Popover>
				{!!error && <span className="error">{error}</span>}
			</Flex>
		</div>
	)
}

export default memo(CMultiSelect)
