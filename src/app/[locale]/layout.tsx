import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { routing } from '@/i18n/routing'

import { LoadingProvider } from '@/context/LoadingContext'
import { ModalProvider } from '@/context/ModalContext'

import MainLayout from '@/Components/Layout/MainLayout'

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
					<MainLayout>{children}</MainLayout>
				</ModalProvider>
			</LoadingProvider>
		</NextIntlClientProvider>
	)
}
