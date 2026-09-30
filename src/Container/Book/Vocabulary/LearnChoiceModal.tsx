'use client'

import { memo } from 'react'
import { IconCards, IconPencil } from '@tabler/icons-react'

import { LearningType } from '@/apis/book/vocabApis'
import CModal from '@/Components/Custom/CModal/CModal'

import classes from './Vocabulary.module.scss'

const CHOICES: { type: LearningType; title: string; hint: string; icon: typeof IconCards }[] = [
	{ type: 'flashcard', title: 'Flashcard', hint: 'Check how much you remember.', icon: IconCards },
	{ type: 'writing', title: 'Writing', hint: 'Test yourself with translation exercises.', icon: IconPencil },
]

/** "How would you like to learn?": Flashcard or Writing */
function LearnChoiceModal({
	open,
	onClose,
	onPick,
}: {
	open: boolean
	onClose: () => void
	onPick: (type: LearningType) => void
}) {
	return (
		<CModal
			open={open}
			centered
			title="How would you like to learn?"
			footer={null}
			onCancel={onClose}
			styles={{ content: { width: 420, maxWidth: 'calc(100vw - 32px)' } }}
		>
			<div className={classes.choices}>
				{CHOICES.map(({ type, title, hint, icon: Icon }) => (
					<button key={type} type="button" className={classes.choice} onClick={() => onPick(type)}>
						<span className={classes.choiceIcon}>
							<Icon size={20} />
						</span>
						<span className={classes.choiceCopy}>
							<b>{title}</b>
							<span>{hint}</span>
						</span>
					</button>
				))}
			</div>
		</CModal>
	)
}

export default memo(LearnChoiceModal)
