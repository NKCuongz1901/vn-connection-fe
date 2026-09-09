import { redirect } from 'next/navigation'

import BookShell from '@/Container/Book/BookShell'
import { BookLibraryProvider } from '@/context/BookLibraryContext'
import { BookPlayerProvider } from '@/context/BookPlayerContext'
import { BOOK_WEB_ENABLED } from '@/Variable/book.variable'

function BookAudioProviders({ children }: { children: React.ReactNode }) {
	return (
		<BookLibraryProvider>
			<BookPlayerProvider>
				<BookShell>{children}</BookShell>
			</BookPlayerProvider>
		</BookLibraryProvider>
	)
}

export default function BookAudioLayout({
	children,
	params,
}: {
	children: React.ReactNode
	params: { locale: string }
}) {
	if (!BOOK_WEB_ENABLED) {
		redirect(`/${params.locale}/mini-apps`)
	}

	return <BookAudioProviders>{children}</BookAudioProviders>
}
