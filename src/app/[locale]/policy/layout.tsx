import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Privacy Policy',
}

export default function PolicyLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return children
}
