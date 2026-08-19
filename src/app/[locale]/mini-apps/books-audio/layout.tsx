'use client'

import BookShell from '@/Container/Book/BookShell/BookShell'
import { BookLibraryProvider } from '@/context/BookLibraryContext'
import { BookPlayerProvider } from '@/context/BookPlayerContext'

export default function BookAudioLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<BookLibraryProvider>
			<BookPlayerProvider>
				<BookShell>{children}</BookShell>
			</BookPlayerProvider>
		</BookLibraryProvider>
	)
}