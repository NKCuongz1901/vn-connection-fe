import type { Metadata } from 'next'

import { POST_ROUTES } from '@/routes'
import { convertParams } from '@/ultis/object'
import { getDateInfo } from '@/ultis/date'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://dev.univini.com'

const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`

export type PublicEventDetail = {
	title?: string
	title_en?: string
	description?: string
	address?: string
	address_en?: string
	start_time?: number | string
	end_time?: number | string
	thumbnails?: string[]
	share_link?: string
	user?: {
		name?: string
		avatar?: string
		id?: string
	}
}

const stripHtml = (text: string) => {
	return text.replace(/<[^>]*>/g, '').trim()
}

const truncate = (text: string, max = 160) => {
	if (!text) return ''
	if (text.length <= max) return text
	return `${text.slice(0, max - 3).trimEnd()}...`
}

const getAbsoluteUrl = (url?: string) => {
	if (!url) return undefined

	if (url.startsWith('http://') || url.startsWith('https://')) {
		return url
	}

	return `${SITE_URL}${url.startsWith('/') ? url : `/${url}`}`
}

const getEventTitle = (event: PublicEventDetail, locale: string) => {
	if (locale === 'en' && event.title_en) return event.title_en

	return event.title || event.title_en || 'Event'
}

const getEventAddress = (event: PublicEventDetail, locale: string) => {
	if (locale === 'en' && event.address_en) return event.address_en

	return event.address || event.address_en
}

const buildEventDescription = (event: PublicEventDetail, locale: string) => {
	const { description, start_time } = event || {}

	if (description) {
		return truncate(stripHtml(description))
	}

	const parts: string[] = []

	if (start_time) {
		const { weekday, dmy, time } = getDateInfo(Number(start_time))
		parts.push(`${weekday}, ${dmy} · ${time}`)
	}

	const address = getEventAddress(event, locale)

	if (address) {
		parts.push(address)
	}

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
			headers: {
				platform: 'WEB',
			},
			next: {
				revalidate: 60,
			},
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
	const pageUrl = `${SITE_URL}/${locale}/${routeSegment}/${id}`

	const fallbackTitle = 'Event | UniVini'
	const fallbackDescription = 'Discover events on UniVini'

	const fallbackMetadata: Metadata = {
		title: fallbackTitle,
		description: fallbackDescription,
		alternates: {
			canonical: pageUrl,
		},
		openGraph: {
			title: fallbackTitle,
			description: fallbackDescription,
			url: pageUrl,
			siteName: 'UniVini',
			type: 'website',
			locale,
			images: [
				{
					url: DEFAULT_OG_IMAGE,
					width: 1200,
					height: 630,
					alt: fallbackTitle,
				},
			],
		},
		twitter: {
			card: 'summary_large_image',
			title: fallbackTitle,
			description: fallbackDescription,
			images: [DEFAULT_OG_IMAGE],
		},
	}

	const event = await fetchPublicEventDetail(id)

	if (!event) return fallbackMetadata

	const eventTitle = getEventTitle(event, locale)
	const metadataTitle = `${eventTitle} | UniVini`
	const description = buildEventDescription(event, locale)
	const image = getAbsoluteUrl(event.thumbnails?.[0]) || DEFAULT_OG_IMAGE

	return {
		title: metadataTitle,
		description,
		alternates: {
			canonical: pageUrl,
		},
		openGraph: {
			title: eventTitle,
			description,
			url: pageUrl,
			siteName: 'UniVini',
			type: 'website',
			locale,
			images: [
				{
					url: image,
					width: 1200,
					height: 630,
					alt: eventTitle,
				},
			],
		},
		twitter: {
			card: 'summary_large_image',
			title: eventTitle,
			description,
			images: [image],
		},
	}
}
