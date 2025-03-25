import { Flex } from 'antd'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'

import { routing } from '@/i18n/routing'

import { LoadingProvider } from '@/context/LoadingContext'
import { ModalProvider } from '@/context/ModalContext'

import MainLayout from '@/Components/Layout/MainLayout'

import { appLayoutAuth } from '../variable/layoutData'

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
	const headersList = headers()
	const pathname = headersList.get('x-x-pathname') || ''
	let content = (
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
	)
	if (!appLayoutAuth.some((i) => pathname.includes(i))) {
		content = (
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
		)
	}
	// Providing all messages to the client
	// side is the easiest way to get started
	const messages = await getMessages()

	return (
		<NextIntlClientProvider messages={messages}>
			<LoadingProvider>
				<ModalProvider>{content}</ModalProvider>
			</LoadingProvider>
		</NextIntlClientProvider>
	)
}
