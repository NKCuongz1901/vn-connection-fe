'use client'

import { BookPlayerProvider } from '@/context/BookPlayerContext'

import BookMiniPlayer from './BookMiniPlayer'

/** Mounted once at the app root so audio keeps playing across route changes, not just inside the Books mini app. */
export default function GlobalBookPlayer({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<BookPlayerProvider>
			{children}
			<BookMiniPlayer />
		</BookPlayerProvider>
	)
}
