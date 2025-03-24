import { Flex } from 'antd'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { LoadingProvider } from '@/context/LoadingContext'
import { ModalProvider } from '@/context/ModalContext'

import { routing } from '@/i18n/routing'

import classes from './classes.module.scss'
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

	// Providing all messages to the client
	// side is the easiest way to get started
	const messages = await getMessages()

	return (
		<NextIntlClientProvider messages={messages}>
			<LoadingProvider>
				<ModalProvider>
					<MainLayout>
						<Flex
							vertical
							className={classes.wrapper}
							style={{
								// background: 'white',
								color: 'black',
								height: '100vh',
								fontSize: 14,
								overflow: 'auto',
							}}
						>
							{children}
						</Flex>
					</MainLayout>
				</ModalProvider>
			</LoadingProvider>
		</NextIntlClientProvider>
	)
}
