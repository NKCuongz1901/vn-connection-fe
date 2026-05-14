import { redirect } from 'next/navigation'

type PageProps = {
	params: { locale: string }
	searchParams: { type?: string }
}

export default function PolicyTermLegacyPage({ params, searchParams }: PageProps) {
	const { locale } = params
	if (searchParams?.type === 'TERMS') {
		redirect(`/${locale}/term`)
	}
	redirect(`/${locale}/policy`)
}
