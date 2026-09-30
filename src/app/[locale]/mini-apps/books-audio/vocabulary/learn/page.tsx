'use client'

import { useSearchParams } from 'next/navigation'

import { LearningType, VocabStrength } from '@/apis/book/vocabApis'
import VocabLearning from '@/Container/Book/Vocabulary/VocabLearning'

const STRENGTHS: VocabStrength[] = ['weak', 'medium', 'strong']

export default function VocabLearnPage() {
	const searchParams = useSearchParams()
	const type: LearningType = searchParams?.get('type') === 'writing' ? 'writing' : 'flashcard'
	const wordType = searchParams?.get('word_type') as VocabStrength | null
	return (
		<VocabLearning
			key={`${type}-${wordType || ''}`}
			type={type}
			wordType={wordType && STRENGTHS.includes(wordType) ? wordType : undefined}
		/>
	)
}
