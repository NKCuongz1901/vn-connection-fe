import { IconCircleXFilled } from '@tabler/icons-react'
import { Flex, Popover } from 'antd'
import clsx from 'clsx'
import React, { memo, useCallback, useEffect, useState } from 'react'

import { useModal } from '@/context/ModalContext'

import { isArray } from '@/ultis/array'

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
	placeholder?: string
	suffixIcon?: React.ReactNode
	prefixIcon?: React.ReactNode
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
		prefixIcon,
		options,
		max,
		placeholder,
		onChange,
	} = props
	const { openError } = useModal()
	const [shows, setShows] = useState(false)
	const [choose, setChoose] = useState<CategoriFavOptProps[]>([])
	const handleChoose = useCallback(
		(data: CategoriFavOptProps) => {
			setChoose((prev) => {
				if (prev.some((i) => i.id === data.id)) {
					return prev.filter((i) => i.id !== data.id)
				} else {
					if (max && isArray(prev, max)) {
						openError('You can only select up to 3 categories')
						return prev
					} else {
						const updated = [...prev, data]
						return updated.sort((a, b) => {
							const orderA = options.find((o) => o.id === a.id)?.order || 9999
							const orderB = options.find((o) => o.id === b.id)?.order || 9999
							return orderA - orderB
						})
					}
				}
			})
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[max, options],
	)
	const toggle = (val) => {
		if (!val) {
			setChoose(value || [])
		}
		setShows(val)
	}
	useEffect(() => {
		setChoose(value || [])
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [JSON.stringify(value)])
	const _renderChooseCatogory = () => {
		return (
			<div className={classes.chooseCatogoryWrapper}>
				<Flex className={classes.chooseCatogoryContainer}>
					<IconCircleXFilled
						className={classes.closeCategory}
						onClick={() => toggle(false)}
					/>
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
					trigger={null}
					open={shows}
					content={_renderChooseCatogory}
					zIndex={1000}
				>
					<Flex
						className={clsx(classes.content, { [classes.error]: !!error })}
						onClick={() => toggle(!shows)}
					>
						<Flex align="center" gap={8}>
							{prefixIcon && (
								<div className={classes.suffixIcon}>{prefixIcon}</div>
							)}
							<div
								className={clsx(classes.label, {
									[classes.opacityDown]: !isArray(choose, 1),
								})}
							>
								{isArray(choose, 1)
									? (choose || []).map((i) => i.title).join(', ')
									: placeholder || 'Which category fits you best?'}
							</div>
						</Flex>
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
