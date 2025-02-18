import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { headers } from 'next/headers'
import { Button, Typography } from 'antd'
import styles from './classes.module.scss'
export default function Term() {
	const t = useTranslations('HomePage')
	const headersList = headers()

	const pathname = headersList.get('x-x-pathname') || ''
	console.log('🎇🧧🧧🧧🎇 TrieuNinhHan ~ Term ~ pathname:', pathname)
	return (
		<div>
			<h1>{t('title', { name: 'hieu' })}</h1>
			<Link href="/about">{t('about')}</Link>
			<Button type="primary">Button</Button>
			<Typography
				title="aha"
				style={{ color: 'white' }}
				className={styles.test}
			>
				aa
			</Typography>
		</div>
	)
}
