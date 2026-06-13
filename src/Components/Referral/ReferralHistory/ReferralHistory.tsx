import React from 'react'

export interface ReferralHistoryProps {
	loading?: boolean
	walletHistory?: any[]
	walletHistoryGroupByMonth?: any[]
	onLoadMore?: () => void
}

function ReferralHistory(_props: ReferralHistoryProps) {
	return <div>ReferralHistory</div>
}

export default ReferralHistory
