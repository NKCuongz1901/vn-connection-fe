'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * People opening a shared link go straight to the content on the web. It runs
 * in the browser only, so link previews (Facebook, Zalo…) still read the
 * page's Open Graph tags instead of following a redirect.
 */
export function ShareRedirect({ to }: { to: string }) {
	const router = useRouter()

	useEffect(() => {
		router.replace(to)
	}, [router, to])

	return <p style={{ color: '#64748b' }}>Opening on UniVini…</p>
}

/** Preview image that hides itself when it fails to load */
export function ShareImage({ src }: { src: string }) {
	const [failed, setFailed] = useState(false)
	if (failed) return null
	return (
		// eslint-disable-next-line @next/next/no-img-element
		<img
			src={src}
			alt=""
			width={1200}
			height={630}
			style={{ width: '100%', height: 'auto', borderRadius: 12 }}
			onError={() => setFailed(true)}
		/>
	)
}
