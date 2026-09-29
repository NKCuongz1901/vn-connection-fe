'use client'

import { memo } from 'react'

import CModal from '@/Components/Custom/CModal/CModal'
import { PaymentInforCourse } from '@/interface/Course/Course.interface'
import { formatNumberString } from '@/ultis/string'

import classes from './CourseDiscountModal.module.scss'

type CourseDiscountModalProps = {
	open: boolean
	onClose: () => void
	paymentInfor?: PaymentInforCourse | null
	onPayNow?: () => void
	isPaying?: boolean
}

const formatPrice = (price?: number | null) => {
	const formatted = formatNumberString(price)
	if (!formatted) return ''
	return `${formatted} đ`
}

/**
 * Shows first-course discount prices from payment info. Pay now starts the
 * same OnePay checkout as Buy now; the server applies the discount.
 */
function CourseDiscountModal({
	open,
	onClose,
	paymentInfor,
	onPayNow,
	isPaying,
}: CourseDiscountModalProps) {
	if (!open) return null

	const percent = paymentInfor?.discount_percentage ?? 0
	const originalPrice = formatPrice(paymentInfor?.original_price)
	const finalPrice = formatPrice(paymentInfor?.final_price)

	return (
		<CModal
			open
			centered
			closable={false}
			footer={null}
			onCancel={onClose}
			styles={{
				content: {
					width: 340,
					maxWidth: 'calc(100vw - 32px)',
					minHeight: 'auto',
					maxHeight: 'none',
					padding: 0,
					borderRadius: 24,
					overflow: 'hidden',
					border: '5px solid rgba(255, 255, 255, 0.2)',
				},
				body: {
					padding: 0,
					overflow: 'hidden',
				},
			}}
		>
			<div className={classes.wrapper}>
				<div className={classes.header}>
					<p className={classes.title}>
						{percent}% off for your first course
					</p>
					<p className={classes.subtitle}>
						Start learning with UniVini and save{' '}
						<span className={classes.percent}>{percent}%</span>
						<br />
						on your first course
					</p>
				</div>

				<img
					src="/images/course/discountCourse.png"
					alt=""
					className={classes.graphic}
					width={300}
					height={222}
				/>

				<div className={classes.bottom}>
					<div className={classes.prices}>
						{originalPrice ? (
							<p className={classes.originalPrice}>{originalPrice}</p>
						) : null}
						{finalPrice ? (
							<p className={classes.finalPrice}>{finalPrice}</p>
						) : null}
					</div>
					<button
						type="button"
						className={classes.payBtn}
						disabled={isPaying}
						aria-busy={isPaying || undefined}
						onClick={() => {
							if (isPaying) return
							onPayNow?.()
						}}
					>
						Pay now
					</button>
				</div>
			</div>
		</CModal>
	)
}

export default memo(CourseDiscountModal)
