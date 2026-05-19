import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Inter } from 'next/font/google'
import './globals.css'
import { headers } from 'next/headers'
import { appLayoutExclusive } from './variable/layoutData'
import { AntdRegistry } from '@ant-design/nextjs-registry'

const geistSans = localFont({
	src: './fonts/GeistVF.woff',
	variable: '--font-geist-sans',
	weight: '100 900',
})
const geistMono = localFont({
	src: './fonts/GeistMonoVF.woff',
	variable: '--font-geist-mono',
	weight: '100 900',
})

const inter = Inter({
	subsets: ['latin', 'vietnamese'],
	variable: '--font-inter',
	display: 'swap',
})

const fontVariables = `${geistSans.variable} ${geistMono.variable} ${inter.variable}`

export const metadata: Metadata = {
	title: 'UniVini',
	description: 'Welcome to https://univini.com/',
	openGraph: {
		title: 'UniVini',
		url: 'https://univini.com/images/univini-logo.png',
		images: [
			{
				url: 'https://univini.com/images/univini-logo.png',
				alt: 'this is UniVini',
			},
		],
		type: 'website',
	},
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const headersList = headers()

	const pathname = headersList.get('x-x-pathname') || ''
	let content = <>{children}</>
	if (appLayoutExclusive.some((i) => i.startsWith(pathname))) {
		content = (
			<html lang="en">
				<body className={fontVariables}>
					<div>{children}</div>
				</body>
			</html>
		)
	}
	return (
		<html lang="en">
			<body className={fontVariables}>
				<AntdRegistry>{content}</AntdRegistry>
			</body>
		</html>
	)
}
