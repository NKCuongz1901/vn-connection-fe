import {
	IconCircleX,
	IconClockFilled,
	IconMapPinFilled,
	IconRepeat,
	IconUsersGroup,
} from '@tabler/icons-react'
import { Flex } from 'antd'
import clsx from 'clsx'
import dayjs from 'dayjs'
import { memo } from 'react'

import useCRUDEvent from '@/hooks/Event/useCRUDEvent'

import { arrayFrom, isArray } from '@/ultis/array.ults'

import CButton from '@/Components/Custom/CButton'
import CCheckRadio from '@/Components/Custom/CCheckRadio'
import CDatePicker from '@/Components/Custom/CDatePicker'
import CImage from '@/Components/Custom/CImage'
import CInput from '@/Components/Custom/CInput'
import CInputMap from '@/Components/Custom/CInputMap'
import CModal from '@/Components/Custom/CModal/CModal'
import CSelect from '@/Components/Custom/CSelect'
import CSelectMuti from '@/Components/Custom/CSelectMuti'
import CSwitch from '@/Components/Custom/CSwitch'
import CTextArea from '@/Components/Custom/CTextArea'
import CUpload from '@/Components/Custom/CUpload'

import { daysOfWeek } from '@/Variable/common.variable'
import { repeatOpt, ticketEntranceTypeOpt } from '@/Variable/select.variable'

import classes from './ModalCRUDEvent.module.scss'

interface ModalCRUDEventProps {
	open: boolean
	data?: any
	edit_type?: any
	onClose: any
	onSuccess?: any
	[key: string]: any
}
const ModalCRUDEvent = ({
	data,
	edit_type,
	onClose,
	onSuccess,
	loadingContext,
}: ModalCRUDEventProps) => {
	const { event, error, toggle, sameDate, onToggle, onChangeValue, onSubmit } =
		useCRUDEvent({ data, onSuccess, onClose, edit_type })
	const { id } = data || {}
	const _renderLeft = () => {
		const { title, thumbnails } = event
		return (
			<Flex className={classes.left} vertical>
				<Flex
					className={clsx(classes.upload, {
						[classes.uploadError]: error.thumbnails,
					})}
				>
					{isArray(thumbnails, 1) ? (
						<CImage src={thumbnails[0]} />
					) : (
						<CUpload onChange={onChangeValue('thumbnails')}>
							<Flex className={classes.uploadText}>Upload image</Flex>
						</CUpload>
					)}
					{isArray(thumbnails, 1) && (
						<Flex className={classes.iconCancel}>
							<IconCircleX onClick={onChangeValue('removeThumbnails')} />
						</Flex>
					)}
				</Flex>
				{!!error.thumbnails && (
					<div className={classes.error}>{error.thumbnails}</div>
				)}
				<Flex className={classes.eventTitle}>
					<CInput
						value={title}
						error={error.title}
						placeholder="Event title"
						onChange={onChangeValue('title')}
					/>
				</Flex>
			</Flex>
		)
	}
	const _renderTopRight = () => {
		const { ticketSw, pricingSw } = toggle
		const { ticket_entrance_type, ticket_entrance, menu_price } = event
		const { min: minEntr, max: maxEntr } = ticket_entrance
		const { min: minPrice, max: maxPrice } = menu_price

		return (
			<>
				<Flex className={classes.entrance} vertical>
					<Flex className={classes.entranceOpt}>
						<span className={classes.title}>Ticket entrance fee</span>
						<CSwitch
							checked={ticketSw}
							onChange={() => onToggle({ key: 'ticketSw', value: !ticketSw })}
							ctype="success"
						/>
					</Flex>
					{ticketSw ? (
						<>
							<Flex className={classes.checkBoxWrapper}>
								{ticketEntranceTypeOpt.map(({ value, label }) => (
									<CCheckRadio
										label={label}
										key={value}
										checked={ticket_entrance_type === value}
										onClick={() => onChangeValue('ticket_entrance_type')(value)}
									/>
								))}
							</Flex>
							<Flex className={classes.entranceFee}>
								{ticket_entrance_type === ticketEntranceTypeOpt[0].value ? (
									<CInput
										value={minEntr}
										error={error.minEntr}
										placeholder="Enter ticket price"
										onChange={onChangeValue('minEntr')}
										suffix={<div>đ</div>}
									/>
								) : (
									<>
										<CInput
											value={minEntr}
											error={error.minEntr}
											placeholder="Min price"
											onChange={onChangeValue('minEntr')}
											suffix={<div>đ</div>}
										/>
										<CInput
											value={maxEntr}
											error={error.maxEntr}
											placeholder="Max price"
											onChange={onChangeValue('maxEntr')}
											suffix={<div>đ</div>}
										/>
									</>
								)}
							</Flex>
						</>
					) : (
						<Flex>It's for free</Flex>
					)}
				</Flex>
				<Flex className={classes.pricing} vertical>
					<Flex className={classes.pricingTop}>
						<span className={classes.title}>Pricing</span>
						<CSwitch
							checked={pricingSw}
							onChange={() => onToggle({ key: 'pricingSw', value: !pricingSw })}
							ctype="success"
						/>
					</Flex>
					{pricingSw && (
						<Flex className={classes.pricingBottom}>
							<CInput
								value={minPrice}
								error={error.minPrice}
								placeholder="Min price"
								onChange={onChangeValue('minPrice')}
								suffix={<div>đ</div>}
							/>
							<CInput
								value={maxPrice}
								error={error.maxPrice}
								placeholder="Max price"
								onChange={onChangeValue('maxPrice')}
								suffix={<div>đ</div>}
							/>
						</Flex>
					)}
				</Flex>
			</>
		)
	}
	const _renderBottomRight = () => {
		const {
			address,
			description,
			limit_participant,
			start_time,
			end_time,
			repeat_type,
			longitude,
			latitude,
		} = event
		const { type, days, amount_of_repeat } = repeat_type
		return (
			<>
				<Flex className={classes.location}>
					<CInputMap
						title="Location"
						value={address}
						longitude={longitude}
						latitude={latitude}
						error={error.address}
						label="Where is my event happening?"
						placeholder="Enter location"
						onSubmitModal={onChangeValue('address')}
						prefix={<IconMapPinFilled />}
					/>
				</Flex>
				<Flex className={classes.time} vertical>
					<span className={classes.title}>When is my event happening?</span>
					<Flex className={classes.timePicker} vertical>
						<CDatePicker
							showTime
							placeholder="Start time"
							value={start_time}
							error={error.start_time}
							minDate={dayjs(Date())}
							onChange={onChangeValue('start_time')}
							suffixIcon={<IconClockFilled />}
						/>
						<CDatePicker
							showTime
							placeholder="End time"
							value={end_time}
							error={error.end_time}
							minDate={dayjs(Date())}
							onChange={onChangeValue('end_time')}
							suffixIcon={<IconClockFilled />}
						/>
					</Flex>
				</Flex>
				<Flex className={classes.numberPeople}>
					<CInput
						value={limit_participant}
						error={error.limit_participant}
						onChange={onChangeValue('limit_participant')}
						label="How many people can join?"
						placeholder="Number of people"
						maxLength={10}
						prefix={<IconUsersGroup />}
					/>
				</Flex>
				<Flex className={classes.desc}>
					<CSelect
						disabled={!!id}
						label="Does this event repeat"
						value={type}
						options={
							sameDate
								? repeatOpt
								: repeatOpt.filter(
										(i) => !['DAILY', 'MULTI_DAYS'].includes(i.value),
								  )
						}
						placeholder="Select type repeat"
						onChange={onChangeValue('type')}
						maxLength={400}
						prefix={<IconRepeat />}
					/>
				</Flex>
				{type === 'MULTI_DAYS' && (
					<Flex className={classes.repeatDay} vertical>
						<CSelectMuti
							disabled={!!id}
							value={days}
							error={error.days}
							options={daysOfWeek}
							label="Days repeat"
							placeholder="Select your days repeat"
							onChange={onChangeValue('days')}
						/>
					</Flex>
				)}
				{type !== repeatOpt[0].value && (
					<Flex className={classes.gap4} vertical>
						<span className={classes.title}>How many times repeat</span>
						<Flex className={classes.repeat}>
							{arrayFrom(15).map((_, index) => (
								<Flex
									className={clsx(classes.repeatItem, {
										[classes.repeatItemChecked]: amount_of_repeat === index + 1,
									})}
									key={index}
									onClick={() => {
										if (!!id) {
											return
										}
										onChangeValue('amount_of_repeat')(index + 1)
									}}
								>
									{index + 1}
								</Flex>
							))}
						</Flex>
					</Flex>
				)}
				<Flex className={classes.desc}>
					<CTextArea
						showCount
						label="Description"
						value={description}
						error={error.description}
						placeholder="Write something here"
						onChange={onChangeValue('description')}
						maxLength={2000}
					/>
				</Flex>
			</>
		)
	}
	const _renderRight = () => {
		return (
			<Flex className={classes.right} vertical>
				{_renderTopRight()}
				{_renderBottomRight()}
			</Flex>
		)
	}
	return (
		<div className={classes.wrapper}>
			<CModal
				onClose={onClose}
				onCancel={onClose}
				title={id ? 'Edit event' : 'Create event'}
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
							style={{ width: 200 }}
						>
							{id ? 'Edit event' : 'Create event'}
						</CButton>
					</Flex>,
				]}
			>
				<div className={classes.container}>
					<Flex className={classes.wrapperModal}>
						{_renderLeft()}
						{_renderRight()}
					</Flex>
				</div>
			</CModal>
		</div>
	)
}

export default memo(ModalCRUDEvent)
