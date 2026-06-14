'use client'

import { SearchOutlined } from '@ant-design/icons'

import CommunityList from '@/Components/Community/CommunityList/CommunityList'
import CInput from '@/Components/Custom/CInput'
import MarkIcon from '@/svg/MarkIcon'

import classes from './ExploreInterestCommunitiesView.module.scss'

interface ExploreInterestCommunitiesViewProps {
	address?: string
	keyword: string
	clubs: any[]
	loading: boolean
	canLoadMoreClub: React.MutableRefObject<boolean>
	onChangeFilter: (value: string) => void
	onScroll: (e: React.UIEvent<HTMLDivElement>) => void
	onLoadMore: () => void
	onUpdateClub: (clubId: string, patch: Record<string, unknown>) => void
}

function ExploreInterestCommunitiesView({
	address,
	keyword,
	clubs,
	loading,
	canLoadMoreClub,
	onChangeFilter,
	onScroll,
	onLoadMore,
	onUpdateClub,
}: ExploreInterestCommunitiesViewProps) {
	return (
		<div className={classes.wrapper}>
			{/* {address ? (
				<div className={classes.locationRow}>
					<MarkIcon fill="#48546B" width={16} height={16} />
					<span>{address}</span>
				</div>
			) : null} */}

			<div className={classes.searchRow}>
				<CInput
					className={classes.searchInput}
					placeholder="Search by keywords"
					value={keyword}
					isNotBold
					allowClear={false}
					bordered={false}
					prefix={<SearchOutlined className={classes.searchIcon} />}
					onChange={(e) => onChangeFilter(e.target.value)}
				/>
			</div>

			<CommunityList
				clubs={clubs}
				loading={loading}
				canLoadMore={canLoadMoreClub}
				onScroll={onScroll}
				onLoadMore={onLoadMore}
				onUpdateClub={onUpdateClub}
				listClassName={classes.listBody}
				scrollClassName={classes.communityListScroll}
			/>
		</div>
	)
}

export default ExploreInterestCommunitiesView

export function ExploreInterestCommunitiesCountBadge({
	total,
}: {
	total: number
}) {
	if (!total) return null

	return <span className={classes.countBadge}>{total}</span>
}

export function ExploreInterestCommunitiesHeaderTitle() {
	return (
		<div className={classes.headerTitle}>
			<span>Communities</span>
		</div>
	)
}
