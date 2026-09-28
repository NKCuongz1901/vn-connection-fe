'use client'

import BookShell from '@/Container/Book/BookShell'
import { BookLibraryProvider } from '@/context/BookLibraryContext'

export default function BookAudioLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<BookLibraryProvider>
			<BookShell>{children}</BookShell>
		</BookLibraryProvider>
	)
}
