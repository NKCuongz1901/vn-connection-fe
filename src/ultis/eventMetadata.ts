import type { Metadata } from 'next'

import { POST_ROUTES } from '@/routes'
import { convertParams } from '@/ultis/object'
import { getDateInfo } from '@/ultis/date'

const SITE_URL = 'https://dev.univini.com'

export type PublicEventDetail = {
	title?: string
	description?: string
	address?: string
	start_time?: number
	end_time?: number
	thumbnails?: string[]
	share_link?: string
	user?: {
		name?: string
	}
}

const stripHtml = (text: string) => text.replace(/<[^>]*>/g, '').trim()

const truncate = (text: string, max = 160) => {
	if (text.length <= max) return text
	return `${text.slice(0, max - 3).trimEnd()}...`
}

const buildEventDescription = (event: PublicEventDetail) => {
	const { description, address, start_time } = event || {}

	if (description) {
		return truncate(stripHtml(description))
	}

	const parts: string[] = []
	if (start_time) {
		const { weekday, dmy, time } = getDateInfo(Number(start_time))
		parts.push(`${weekday}, ${dmy} · ${time}`)
	}
	if (address) parts.push(address)

	return parts.length
		? truncate(parts.join(' · '))
		: 'Join this event on UniVini'
}

export const fetchPublicEventDetail = async (
	id: string,
): Promise<PublicEventDetail | null> => {
	const apiUrl = process.env.NEXT_PUBLIC_API_URL
	if (!id || !apiUrl) return null

	const params = convertParams({
		fields: ['$all', { user: ['name', 'avatar', 'id'] }],
	})
	const query = new URLSearchParams(params).toString()
	const url = `${apiUrl}/${POST_ROUTES.publicEventDetail}/${id}?${query}`

	try {
		const res = await fetch(url, {
			headers: { platform: 'WEB' },
			next: { revalidate: 60 },
		})

		if (!res.ok) return null

		const data = await res.json()
		if (data?.code !== 200) return null

		return data?.results?.object ?? null
	} catch {
		return null
	}
}

export const generateEventMetadata = async ({
	id,
	locale,
	routeSegment,
}: {
	id: string
	locale: string
	routeSegment: 'event' | 'public-event'
}): Promise<Metadata> => {
	const fallback: Metadata = {
		title: 'Event | UniVini',
		description: 'Discover events on UniVini',
	}

	const event = await fetchPublicEventDetail(id)
	if (!event) return fallback

	const { title, thumbnails, share_link } = event
	const description = buildEventDescription(event)
	const image = thumbnails?.[0]
	const pageUrl = share_link || `${SITE_URL}/${locale}/${routeSegment}/${id}`

	return {
		title: title ? `${title} | UniVini` : fallback.title,
		description,
		alternates: {
			canonical: pageUrl,
		},
		openGraph: {
			title: title || 'Event | UniVini',
			description,
			url: pageUrl,
			siteName: 'UniVini',
			type: 'website',
			locale,
			...(image
				? {
						images: [{ url: image, alt: title || 'Event' }],
					}
				: {}),
		},
		twitter: {
			card: 'summary_large_image',
			title: title || 'Event | UniVini',
			description,
			...(image ? { images: [image] } : {}),
		},
	}
}
