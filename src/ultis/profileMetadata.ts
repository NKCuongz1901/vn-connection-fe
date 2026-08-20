import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://dev.univini.com'
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`

type PublicProfile = {
	id: string
	name?: string
	about_me?: string
	avatar?: string
	share_preview_image?: string
}

const truncate = (value: string, max = 160) =>
	value.length <= max ? value : `${value.slice(0, max - 3).trimEnd()}...`

const stripHtml = (value?: string) =>
	(value || '').replace(/<[^>]*>/g, '').trim()

const fetchPublicProfile = async (id: string): Promise<PublicProfile | null> => {
	const apiUrl = process.env.NEXT_PUBLIC_API_URL
	if (!apiUrl || !id) return null

	try {
		const response = await fetch(`${apiUrl}/user/public/${id}`, {
			headers: { platform: 'WEB' },
			next: { revalidate: 60 },
		})
		if (!response.ok) return null
		const data = await response.json()
		return data?.code === 200 ? data?.results?.object || null : null
	} catch {
		return null
	}
}

export const generateProfileMetadata = async ({
	id,
	locale,
}: {
	id: string
	locale: string
}): Promise<Metadata> => {
	const pageUrl = `${SITE_URL}/${locale}/profile/${id}`
	const profile = await fetchPublicProfile(id)
	const name = profile?.name?.trim() || 'Profile'
	const description = truncate(
		stripHtml(profile?.about_me) || 'Connect with this profile on UniVini',
	)
	const image = profile?.share_preview_image || profile?.avatar || DEFAULT_OG_IMAGE

	return {
		title: `${name} on UniVini`,
		description,
		alternates: { canonical: pageUrl },
		openGraph: {
			title: `${name} on UniVini`,
			description,
			url: pageUrl,
			siteName: 'UniVini',
			type: 'profile',
			locale,
			images: [{ url: image }],
		},
		twitter: {
			card: 'summary_large_image',
			title: `${name} on UniVini`,
			description,
			images: [image],
		},
	}
}
