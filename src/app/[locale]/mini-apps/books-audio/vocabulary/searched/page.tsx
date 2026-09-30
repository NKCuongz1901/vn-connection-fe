'use client'

import { useSearchParams } from 'next/navigation'

import { VocabStrength } from '@/apis/book/vocabApis'
import SearchedVocabByStrength from '@/Container/Book/Vocabulary/SearchedVocabByStrength'

const TYPES: VocabStrength[] = ['weak', 'medium', 'strong']

export default function SearchedVocabPage() {
	const searchParams = useSearchParams()
	const type = searchParams?.get('type') as VocabStrength | null
	return <SearchedVocabByStrength type={type && TYPES.includes(type) ? type : 'weak'} />
}
