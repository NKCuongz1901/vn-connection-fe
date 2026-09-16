import type { Metadata } from 'next'
import { generateProfileMetadata } from '@/ultis/profileMetadata'

type Props = {
	children: React.ReactNode
	params: Promise<{ locale: string; id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { locale, id } = await params
	return await generateProfileMetadata({ id, locale })
}

export default function PublicProfileLayout({ children }: Props) {
	return children
}
