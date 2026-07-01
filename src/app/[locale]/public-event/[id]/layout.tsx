import type { Metadata } from 'next'

import { generateEventMetadata } from '@/ultis/eventMetadata'

type Props = {
	children: React.ReactNode
	params: Promise<{
		locale: string
		id: string
	}>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { locale, id } = await params

	return generateEventMetadata({
		id,
		locale,
		routeSegment: 'public-event',
	})
}

export default function PublicEventDetailLayout({ children }: Props) {
	return children
}
