'use client'

import { useParams } from 'next/navigation'

import MyBookDetail from '@/Container/Book/Contribute/MyBookDetail'

export default function MyBookDetailPage() {
	const params = useParams()
	const bookId = String(params?.id || '')

	return <MyBookDetail bookId={bookId} />
}
