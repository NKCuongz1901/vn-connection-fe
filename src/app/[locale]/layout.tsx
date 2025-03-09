import { Flex } from 'antd'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { routing } from '@/i18n/routing'

import classes from './classes.module.scss'
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
			<Flex
				vertical
				className={classes.wrapper}
				style={{
					background: 'white',
					color: 'black',
					height: '100vh',
					fontSize: 14,
					overflow: 'auto',
				}}
			>
				{children}
			</Flex>
		</NextIntlClientProvider>
	)
}
