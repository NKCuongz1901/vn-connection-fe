'use client'

import { useMemo } from 'react'

import CCheckboxSelect from '@/Components/Custom/CCheckboxSelect'
import CRadioSelect from '@/Components/Custom/CRadioSelect'
import SearchIcon from '@/svg/SearchIcon'
import { levelOptions } from '@/Variable/common.variable'

import classes from './TalkRoomFilterBar.module.scss'

type TalkRoomFilterBarProps = {
	searchKeyword: string
	languageId?: string
	levelValues?: string[]
	languageOptions?: { label: string; value: string }[]
	loadingLanguages?: boolean
	onChangeSearchKeyword: (value: string) => void
	onChangeLanguage: (languageId: string) => void
	onChangeLevel: (levels: string[]) => void
}

function TalkRoomFilterBar({
	searchKeyword,
	languageId = '',
	levelValues = [],
	languageOptions = [],
	loadingLanguages,
	onChangeSearchKeyword,
	onChangeLanguage,
	onChangeLevel,
}: TalkRoomFilterBarProps) {
	const filterLanguageOptions = useMemo(
		() =>
			languageOptions.length
				? [{ label: 'All languages', value: '' }, ...languageOptions]
				: [],
		[languageOptions],
	)

	return (
		<div className={classes.wrapper}>
			<div className={classes.searchWrapper}>
				<span className={classes.searchIcon}>
					<SearchIcon fill="#48546B" width={20} height={20} />
				</span>
				<input
					type="text"
					className={classes.searchInput}
					placeholder="Search name or host or topic"
					value={searchKeyword}
					onChange={(e) => onChangeSearchKeyword(e.target.value)}
				/>
			</div>

			<div className={classes.chipsRow}>
				<CRadioSelect
					variant="chip"
					placeholder="Language"
					options={filterLanguageOptions}
					value={languageId}
					onChange={onChangeLanguage}
					disabled={loadingLanguages}
				/>
				<CCheckboxSelect
					variant="chip"
					immediateSelect
					placeholder="Level"
					options={levelOptions}
					value={levelValues}
					onChange={onChangeLevel}
					maxSelected={2}
				/>
			</div>
		</div>
	)
}

export default TalkRoomFilterBar
