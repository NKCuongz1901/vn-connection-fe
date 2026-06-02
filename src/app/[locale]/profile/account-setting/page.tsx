import { redirect } from 'next/navigation'

type PageProps = {
	params: { locale: string }
}

export default function AccountSettingPage({ params }: PageProps) {
	const { locale } = params
	redirect(`/${locale}/profile/account-setting/manage-account`)
}
