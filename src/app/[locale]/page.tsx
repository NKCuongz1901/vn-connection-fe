import { redirect } from '@/i18n/routing'

export default function LocaleHomePage({
	params: { locale },
}: {
	params: { locale: string }
}) {
	redirect({ href: '/overview', locale })
}
