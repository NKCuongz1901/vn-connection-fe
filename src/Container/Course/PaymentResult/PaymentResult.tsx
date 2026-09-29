'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Spin } from 'antd'

import { getCourseDetail } from '@/apis/courseApis'
import { Course } from '@/interface/Course/Course.interface'
import { mainRoutes } from '@/routes/MainRoutes'
import { useLocalePath } from '@/ultis/route'

import classes from './PaymentResult.module.scss'

/**
 * Where OnePay sends a learner who paid on the website (UNIWEB-697). The API's
 * ReturnURL redirects here with course_id, ref, status and success. Those only
 * pick the first message: the page reads the course again, and the course
 * counts as bought only when the server says so. The OnePay IPN settles the
 * payment, often a few seconds after the learner lands, so a payment OnePay
 * reported as paid is re-checked for a short while before the page gives up.
 */

const UUID_PATTERN =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const RECHECK_INTERVAL_MS = 3000
const RECHECK_LIMIT = 10

type ResultState = 'checking' | 'paid' | 'confirming' | 'failed'

type ReturnParams = {
	courseId: string
	ref: string
	status: string
	success: boolean
}

const readReturnParams = (): ReturnParams => {
	const params = new URLSearchParams(window.location.search)
	const courseId = params.get('course_id') || ''
	return {
		courseId: UUID_PATTERN.test(courseId) ? courseId : '',
		ref: (params.get('ref') || '').slice(0, 128),
		status: params.get('status') || '',
		success: params.get('success') === '1',
	}
}

const COPY: Record<ResultState, { title: string; message: string }> = {
	checking: {
		title: 'Checking your payment',
		message: 'One moment while we check your payment with UniVini.',
	},
	paid: {
		title: 'Payment successful',
		message: 'Your course is ready. You can start learning now.',
	},
	confirming: {
		title: 'Payment is being confirmed',
		message:
			'OnePay has not confirmed the payment yet. This can take a few minutes; the course opens as soon as it does.',
	},
	failed: {
		title: 'Payment not completed',
		message:
			'The payment did not go through and you have not been charged for this course. You can try again from the course page.',
	},
}

function PaymentResult() {
	const { onChangeRoute } = useLocalePath()
	const [params, setParams] = useState<ReturnParams | null>(null)
	const [course, setCourse] = useState<Course | null>(null)
	const [state, setState] = useState<ResultState>('checking')
	const attemptsRef = useRef(0)

	useEffect(() => {
		setParams(readReturnParams())
	}, [])

	const checkCourse = useCallback(async (courseId: string) => {
		try {
			const res: any = await getCourseDetail(courseId)
			const next: Course | null = res?.results?.object || null
			setCourse(next)
			// A running free trial is not this purchase; only a bought row counts.
			return next?.userCourse?.payment_status === 'purchased'
		} catch {
			return false
		}
	}, [])

	useEffect(() => {
		if (!params) return
		if (!params.courseId) {
			setState('failed')
			return
		}
		let cancelled = false
		let timer: number | undefined
		// Only a payment OnePay reported as paid, or one still waiting for the
		// IPN, is worth waiting for.
		const mayStillSettle =
			params.success || params.status === 'pending' || params.status === ''

		const run = async () => {
			attemptsRef.current += 1
			const paid = await checkCourse(params.courseId)
			if (cancelled) return
			if (paid) {
				setState('paid')
				return
			}
			if (!mayStillSettle) {
				setState('failed')
				return
			}
			if (attemptsRef.current >= RECHECK_LIMIT) {
				setState('confirming')
				return
			}
			setState('checking')
			timer = window.setTimeout(run, RECHECK_INTERVAL_MS)
		}
		run()
		return () => {
			cancelled = true
			if (timer) window.clearTimeout(timer)
		}
	}, [params, checkCourse])

	const openCourse = () => {
		if (params?.courseId) {
			onChangeRoute(`${mainRoutes.course}/${params.courseId}`)
			return
		}
		onChangeRoute(mainRoutes.courseOverview)
	}

	const copy = COPY[state]

	return (
		<div className={classes.wrapper}>
			<div className={classes.card} role="status" aria-live="polite">
				{state === 'checking' ? <Spin size="large" /> : null}
				<p
					className={`${classes.title} ${
						state === 'paid'
							? classes.success
							: state === 'failed'
								? classes.error
								: ''
					}`}
				>
					{copy.title}
				</p>
				{course?.name ? (
					<p className={classes.courseName}>{course.name}</p>
				) : null}
				<p className={classes.message}>{copy.message}</p>
				{params?.ref ? (
					<p className={classes.reference}>Reference: {params.ref}</p>
				) : null}
				<div className={classes.actions}>
					<button
						type="button"
						className={classes.primaryBtn}
						onClick={openCourse}
					>
						{state === 'failed' ? 'Back to course' : 'Open course'}
					</button>
					<button
						type="button"
						className={classes.secondaryBtn}
						onClick={() => onChangeRoute(mainRoutes.courseOverview)}
					>
						Course overview
					</button>
				</div>
			</div>
		</div>
	)
}

export default PaymentResult
