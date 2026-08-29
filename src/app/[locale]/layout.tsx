import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { routing } from '@/i18n/routing'

import { LoadingProvider } from '@/context/LoadingContext'
import { ModalProvider } from '@/context/ModalContext'
import { SocketProvider } from '@/context/SocketContext'
import { SocketToastProvider } from '@/context/SocketToastContext'
import { NewInboxProvider } from '@/context/NewInboxContext'
import { NewDeviceSecurityProvider } from '@/context/NewDeviceSecurityContext'
import { SearchLocationProvider } from '@/context/SearchLocationContext'

import MainLayout from '@/Components/Layout/MainLayout'
import ToastProvider from '@/Components/Toast/ToastProvider'
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
					<ToastProvider>
						<SocketProvider>
							<NewDeviceSecurityProvider>
								<SocketToastProvider>
									<NewInboxProvider>
										<SearchLocationProvider>
											<MainLayout>{children}</MainLayout>
										</SearchLocationProvider>
									</NewInboxProvider>
								</SocketToastProvider>
							</NewDeviceSecurityProvider>
						</SocketProvider>
					</ToastProvider>
				</ModalProvider>
			</LoadingProvider>
		</NextIntlClientProvider>
	)
}
