'use client'
import { Flex } from 'antd'
import { useState } from 'react'

import CModal from '@/Components/Custom/CModal/CModal'
import CButton from '@/Components/Custom/CButton'
import CTextArea from '@/Components/Custom/CTextArea'

import classes from './ModelChooseHangout.module.scss'

const suggestion = [
	'visit tourist attractions',

	'take a day trip',

	'grab beers',

	'go for a walk',

	'get some food',

	'explore the area',

	'exchange languages',

	'drink tea or coffee',

	'catch a movie',

	'bar hopping',

	'attend an event',
]
interface ModelChooseHangoutProps {
	data?: any
	onClose: () => void
	onSubmit: (data: any) => void
}

const ModelChooseHangout = ({
	data,
	onClose,
	onSubmit,
}: ModelChooseHangoutProps) => {
	const [state, setState] = useState(data)
	return (
		<div className={classes.wrapper}>
			<CModal
				onClose={onClose}
				onCancel={onClose}
				title={'Edit status'}
				styles={{
					content: {
						width: 800,
					},
				}}
				footer={[
					<Flex key="back" justify="flex-end">
						<CButton
							onClick={() => onSubmit(state)}
							ctype="oranger"
							style={{ width: 200 }}
						>
							Save
						</CButton>
					</Flex>,
				]}
			>
				<div className={classes.container}>
					<Flex className={classes.wrapperModal}>
						<CTextArea
							showCount
							value={state}
							placeholder="Write something here"
							onChange={(e) => setState(e.target.value)}
							maxLength={60}
						/>
					</Flex>
					<Flex className={classes.wrapperSuggestion}>
						{suggestion.map((item) => (
							<span
								key={item}
								onClick={() => setState(item)}
								className={classes.item}
							>
								{item}
							</span>
						))}
					</Flex>
				</div>
			</CModal>
		</div>
	)
}

export default ModelChooseHangout
