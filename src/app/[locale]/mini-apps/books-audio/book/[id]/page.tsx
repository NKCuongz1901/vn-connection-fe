'use client'

import { useParams } from 'next/navigation'

import BookDetail from '@/Container/Book/BookDetail'

export default function BookDetailPage() {
	const params = useParams()
	const bookId = String(params?.id || '')

	return <BookDetail bookId={bookId} />
}
