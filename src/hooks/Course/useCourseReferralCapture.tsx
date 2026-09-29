'use client'

import { useEffect } from 'react'

import {
	registerCourseReferral,
	registerGlobalCourseReferral,
} from '@/apis/courseApis'
import { isLogin } from '@/ultis/storage'

/**
 * REF links on the website (UNIWEB-696). A course or global referral link that
 * opens a web page carries the sharer's invite code as ?invite_code=. The web
 * registers it the way the app does (course_app_link.dart): the per-course
 * link with /course-ai/referral/register, the global link with
 * /course-ai/referral/global/register, so a later purchase credits the sharer.
 *
 * Someone who is not signed in yet keeps the link in this browser until they
 * are, and it is registered on the next course page they open signed in. The
 * newest link wins, as on the server (UD-417).
 */

const PENDING_KEY = 'univini_course_pending_referral'
const PENDING_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000
const UUID_PATTERN =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type PendingReferral = {
	inviteCode: string
	courseId?: string
	savedAt: number
}

const readPending = (): PendingReferral | null => {
	try {
		const raw = window.localStorage.getItem(PENDING_KEY)
		if (!raw) return null
		const parsed = JSON.parse(raw) as PendingReferral
		if (!parsed?.inviteCode) return null
		if (Date.now() - (parsed.savedAt || 0) > PENDING_MAX_AGE_MS) {
			window.localStorage.removeItem(PENDING_KEY)
			return null
		}
		return parsed
	} catch {
		return null
	}
}

const writePending = (pending: PendingReferral | null) => {
	try {
		if (pending) {
			window.localStorage.setItem(PENDING_KEY, JSON.stringify(pending))
		} else {
			window.localStorage.removeItem(PENDING_KEY)
		}
	} catch {
		// storage blocked: the referral is simply not kept
	}
}

/** Reads ?invite_code= from the address, trimmed; a code is short and plain. */
export const readInviteCodeFromLocation = () => {
	if (typeof window === 'undefined') return ''
	const code = new URLSearchParams(window.location.search)
		.get('invite_code')
		?.trim()
	if (!code || code.length > 64 || !/^[A-Za-z0-9_-]+$/.test(code)) return ''
	return code
}

let flushing = false

const flushPending = async () => {
	if (flushing || !isLogin()) return
	const pending = readPending()
	if (!pending) return
	flushing = true
	try {
		if (pending.courseId) {
			await registerCourseReferral(pending.courseId, pending.inviteCode)
		} else {
			await registerGlobalCourseReferral(pending.inviteCode)
		}
		writePending(null)
	} catch (error: any) {
		// A refused code (own code, unknown code, course already bought) is not
		// the learner's problem to see; the app only logs it too. A refusal is
		// final, a network or server failure is tried again next time.
		console.log('Course referral was not registered', error)
		const code = Number(error?.code)
		if (code >= 400 && code < 500) writePending(null)
	} finally {
		flushing = false
	}
}

/**
 * Keeps the invite code of the link that opened this page, then registers it
 * as soon as the viewer is signed in. Pass the course id on a per-course page;
 * leave it out on pages the global link opens.
 */
export default function useCourseReferralCapture(courseId?: string) {
	useEffect(() => {
		const inviteCode = readInviteCodeFromLocation()
		if (inviteCode) {
			const validCourseId =
				courseId && UUID_PATTERN.test(courseId) ? courseId : undefined
			writePending({ inviteCode, courseId: validCourseId, savedAt: Date.now() })
		}
		flushPending()
	}, [courseId])
}
