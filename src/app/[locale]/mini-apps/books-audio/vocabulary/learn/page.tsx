'use client'

import { useSearchParams } from 'next/navigation'

import { LearningType, VocabStrength } from '@/apis/book/vocabApis'
import VocabLearning from '@/Container/Book/Vocabulary/VocabLearning'

const STRENGTHS: VocabStrength[] = ['weak', 'medium', 'strong']

export default function VocabLearnPage() {
	const searchParams = useSearchParams()
	const type: LearningType = searchParams?.get('type') === 'writing' ? 'writing' : 'flashcard'
	const wordType = searchParams?.get('word_type') as VocabStrength | null
	const folderId = searchParams?.get('folder') || undefined
	const setName = searchParams?.get('name') || undefined
	return (
		<VocabLearning
			key={`${type}-${wordType || ''}-${folderId || ''}`}
			type={type}
			folderId={folderId}
			setName={setName}
			wordType={wordType && STRENGTHS.includes(wordType) ? wordType : undefined}
		/>
	)
}
