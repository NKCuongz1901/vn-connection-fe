'use client'

import { useEffect, useState } from 'react'

import useCourseReferralCapture from '@/hooks/Course/useCourseReferralCapture'

/**
 * For pages outside the Course section that a Course REF link can open, such
 * as /open-app?type=course&id=<course>&invite_code=<code>: keeps the referral
 * so it is registered once the viewer is signed in. Renders nothing.
 */
function CourseReferralCapture() {
	const [target, setTarget] = useState<{ ready: boolean; courseId?: string }>({
		ready: false,
	})

	useEffect(() => {
		const params = new URLSearchParams(window.location.search)
		const type = params.get('type')
		if (type === 'course') {
			setTarget({ ready: true, courseId: params.get('id') || undefined })
		} else if (type === 'course_ai_global') {
			setTarget({ ready: true })
		}
	}, [])

	return target.ready ? <Capture courseId={target.courseId} /> : null
}

function Capture({ courseId }: { courseId?: string }) {
	useCourseReferralCapture(courseId)
	return null
}

export default CourseReferralCapture
