import type { Metadata } from 'next'

import OpenApp from '@/Container/Open-app'

export const metadata: Metadata = {
	title: 'Download UniVini — Exchange Languages, Build Networks, Travel',
	description:
		'Download the UniVini app to exchange languages, build networks, and travel the world. Available on iOS and Android.',
	openGraph: {
		title: 'Download UniVini App',
		description:
			'Exchange languages, build networks, travel. Get the UniVini app today.',
	},
}

export default function OpenAppPage() {
	return <OpenApp />
}
