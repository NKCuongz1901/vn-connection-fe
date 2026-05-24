import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { routing } from '@/i18n/routing'

import { LoadingProvider } from '@/context/LoadingContext'
import { ModalProvider } from '@/context/ModalContext'
import { SocketProvider } from '@/context/SocketContext'
import { NewInboxProvider } from '@/context/NewInboxContext'
import { SearchLocationProvider } from '@/context/SearchLocationContext'

import MainLayout from '@/Components/Layout/MainLayout'
import 'country-flag-icons/3x2/flags.css'

export default async function LocaleLayout({
	children,
	params: { locale },
}: {
	children: React.ReactNode
	params: { locale: string }
}) {
	// Ensure that the incoming `locale` is valid
	if (!routing.locales.includes(locale as any)) {
		notFound()
	}
	// const headersList = headers()
	// const pathname = headersList.get('x-x-pathname') || ''

	// Providing all messages to the client
	// side is the easiest way to get started
	const messages = await getMessages()

	return (
		<NextIntlClientProvider messages={messages}>
			<LoadingProvider>
				<ModalProvider>
					<SocketProvider>
						<NewInboxProvider>
							<SearchLocationProvider>
								<MainLayout>{children}</MainLayout>
							</SearchLocationProvider>
						</NewInboxProvider>
					</SocketProvider>
				</ModalProvider>
			</LoadingProvider>
		</NextIntlClientProvider>
	)
}
