'use client'

import CCheckboxSelect from '@/Components/Custom/CCheckboxSelect'
import SelectLanguage from '@/Components/TalkRoom/SelectLanguage'
import SearchIcon from '@/svg/SearchIcon'
import { levelOptions } from '@/Variable/common.variable'

import classes from './TalkRoomFilterBar.module.scss'

type TalkRoomFilterBarProps = {
	searchKeyword: string
	languageIds?: string[]
	levelValues?: string[]
	languageOptions?: { label: string; value: string; flag?: string }[]
	loadingLanguages?: boolean
	onChangeSearchKeyword: (value: string) => void
	onChangeLanguage: (languageIds: string[]) => void
	onChangeLevel: (levels: string[]) => void
}

function TalkRoomFilterBar({
	searchKeyword,
	languageIds = [],
	levelValues = [],
	languageOptions = [],
	loadingLanguages,
	onChangeSearchKeyword,
	onChangeLanguage,
	onChangeLevel,
}: TalkRoomFilterBarProps) {
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
				<SelectLanguage
					placeholder="Language"
					options={languageOptions}
					value={languageIds}
					onChange={onChangeLanguage}
					disabled={loadingLanguages}
				/>
				<CCheckboxSelect
					variant="chip"
					confirmOnly
					confirmLabel="Confirm"
					placeholder="Level"
					options={levelOptions}
					value={levelValues}
					onChange={onChangeLevel}
					maxSelected={3}
				/>
			</div>
		</div>
	)
}

export default TalkRoomFilterBar
