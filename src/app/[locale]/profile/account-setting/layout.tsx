import AccountSettingLayout from '@/Container/AccountSetting'
import { ReactNode } from 'react'

export default function AccountSettingLayoutRoute({
	children,
}: {
	children: ReactNode
}) {
	return <AccountSettingLayout>{children}</AccountSettingLayout>
}
