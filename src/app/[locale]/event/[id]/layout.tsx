import type { Metadata } from 'next'

import { generateEventMetadata } from '@/ultis/eventMetadata'

type Props = {
	children: React.ReactNode
	params: { locale: string; id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	return generateEventMetadata({
		id: params.id,
		locale: params.locale,
		routeSegment: 'event',
	})
}

export default function EventDetailLayout({ children }: Props) {
	return children
}
