import type { Metadata } from 'next'
import Link from 'next/link'

import { bookDetailPath } from '@/Variable/book.variable'

import { ShareImage, ShareRedirect } from './ShareClient'

type Props = {
	params: Promise<{ locale: string; type: string; id: string }>
	searchParams: Promise<{ token?: string | string[] }>
}

type SharePreview = {
	title: string
	description: string
	image: string | null
	open_app_link: string | null
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dev.univini.com'
const defaultImage = `${siteUrl}/og-default.png`

const getToken = (value?: string | string[]) =>
	Array.isArray(value) ? value[0] : value

// Shared content the web can open directly; other types keep the preview page
const webPathForShare = (locale: string, type: string, id: string) => {
	if (type === 'book') return `/${locale}/${bookDetailPath(id)}`
	return null
}

const getSharePreview = async ({
	type,
	id,
	token,
}: {
	type: string
	id: string
	token?: string
}): Promise<SharePreview | null> => {
	const apiUrl = process.env.NEXT_PUBLIC_API_URL
	if (!apiUrl || !token) return null

	const query = new URLSearchParams({ token })
	try {
		const response = await fetch(
			`${apiUrl}/share-preview/${encodeURIComponent(type)}/${encodeURIComponent(
				id,
			)}?${query.toString()}`,
			{ next: { revalidate: 60 } },
		)
		if (!response.ok) return null
		const body = await response.json()
		return body?.code === 200 ? body?.results?.object || null : null
	} catch {
		return null
	}
}

export async function generateMetadata({
	params,
	searchParams,
}: Props): Promise<Metadata> {
	const [{ locale, type, id }, query] = await Promise.all([params, searchParams])
	const token = getToken(query.token)
	const preview = await getSharePreview({ type, id, token })
	const pageUrl = new URL(
		`/${locale}/share/${encodeURIComponent(type)}/${encodeURIComponent(id)}`,
		siteUrl,
	)
	if (token) pageUrl.searchParams.set('token', token)
	const image = preview?.image || defaultImage
	const title = preview?.title || 'UniVini'
	const description = preview?.description || 'Discover UniVini'

	return {
		title,
		description,
		alternates: { canonical: pageUrl.toString() },
		openGraph: {
			title,
			description,
			url: pageUrl.toString(),
			siteName: 'UniVini',
			type: 'website',
			locale,
			images: [{ url: image }],
		},
		twitter: {
			card: 'summary_large_image',
			title,
			description,
			images: [image],
		},
	}
}

export default async function SharePage({ params, searchParams }: Props) {
	const [{ locale, type, id }, query] = await Promise.all([params, searchParams])
	const preview = await getSharePreview({
		type,
		id,
		token: getToken(query.token),
	})
	const webPath = webPathForShare(locale, type, id)

	return (
		<main
			style={{
				maxWidth: 640,
				margin: '0 auto',
				padding: '48px 24px',
				fontFamily: 'Arial, sans-serif',
			}}
		>
			{webPath ? <ShareRedirect to={webPath} /> : null}
			{preview?.image ? <ShareImage src={preview.image} /> : null}
			<h1>{preview?.title || 'UniVini'}</h1>
			<p>{preview?.description || 'Discover UniVini'}</p>
			{preview?.open_app_link ? (
				<a href={preview.open_app_link}>Open in UniVini</a>
			) : (
				<Link href={`/${locale}/open-app`}>Open UniVini</Link>
			)}
		</main>
	)
}
