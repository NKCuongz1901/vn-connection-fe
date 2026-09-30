'use client'

import { useParams } from 'next/navigation'

import MySetDetail from '@/Container/Book/Vocabulary/MySetDetail'

export default function MySetPage() {
	const params = useParams()
	return <MySetDetail folderId={String(params?.id || '')} />
}
