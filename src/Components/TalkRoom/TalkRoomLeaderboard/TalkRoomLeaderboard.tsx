'use client'

import { IconChevronDown } from '@tabler/icons-react'
import { Popover } from 'antd'
import clsx from 'clsx'
import { memo, useMemo, useState } from 'react'

import ReferralLeaderboardList from '@/Components/Referral/ReferralLeaderBoardList/ReferralLeaderboardList'
import ReferralLeaderboardPodium from '@/Components/Referral/ReferralLeaderboardPodium/ReferralLeaderboardPodium'
import { LeaderboardUser } from '@/Components/Referral/ReferralPodiumItem/ReferralPodiumItem'

import classes from './TalkRoomLeaderboard.module.scss'

export type TalkRoomLeaderboardMetric = 'host_time' | 'speak_time'
export type TalkRoomLeaderboardPeriod = 'monthly' | 'yearly' | 'all_time'

export interface TalkRoomLeaderboardProps {
	loading?: boolean
	leaderBoard?: LeaderboardUser[]
	topHosts?: LeaderboardUser[]
	myPosition?: number
	userData?: any
	metric?: TalkRoomLeaderboardMetric
	period?: TalkRoomLeaderboardPeriod
	onChangeMetric?: (metric: TalkRoomLeaderboardMetric) => void
	onChangePeriod?: (period: TalkRoomLeaderboardPeriod) => void
}

const METRIC_OPTIONS = [
	{
		value: 'host_time' as const,
		label: 'Host time',
		triggerLabel: 'Host time',
	},
	{
		value: 'speak_time' as const,
		label: 'Speak time',
		triggerLabel: 'Speak time',
	},
]

const PERIOD_OPTIONS = [
	{
		value: 'monthly' as const,
		label: 'By this month (default)',
		triggerLabel: 'By this month',
	},
	{
		value: 'yearly' as const,
		label: 'By this year',
		triggerLabel: 'By this year',
	},
	{
		value: 'all_time' as const,
		label: 'All time',
		triggerLabel: 'All time',
	},
]

type FilterMenuProps<T extends string> = {
	options: { value: T; label: string }[]
	value: T
	onChange: (value: T) => void
	onClose: () => void
}

/** Radio-style popover menu for leaderboard filters */
function FilterMenu<T extends string>({
	options,
	value,
	onChange,
	onClose,
}: FilterMenuProps<T>) {
	return (
		<div className={classes.filterMenu}>
			{options.map((option) => {
				const isActive = option.value === value
				return (
					<button
						key={option.value}
						type="button"
						className={classes.filterItem}
						onClick={() => {
							onChange(option.value)
							onClose()
						}}
					>
						<span className={classes.filterControl}>
							<span
								className={clsx(classes.radioCircle, {
									[classes.radioCircleActive]: isActive,
								})}
							/>
						</span>
						<span className={classes.filterLabel}>{option.label}</span>
					</button>
				)
			})}
		</div>
	)
}

/** Talk Room leaderboard with metric + period filters, podium and list */
function TalkRoomLeaderboard({
	loading,
	leaderBoard = [],
	topHosts = [],
	myPosition = 0,
	userData = {},
	metric = 'host_time',
	period = 'monthly',
	onChangeMetric,
	onChangePeriod,
}: TalkRoomLeaderboardProps) {
	const [metricOpen, setMetricOpen] = useState(false)
	const [periodOpen, setPeriodOpen] = useState(false)

	const selectedMetric = useMemo(
		() => METRIC_OPTIONS.find((option) => option.value === metric),
		[metric],
	)

	const selectedPeriod = useMemo(
		() => PERIOD_OPTIONS.find((option) => option.value === period),
		[period],
	)

	return (
		<div className={classes.wrapper}>
			<div className={classes.filters}>
				<Popover
					open={metricOpen}
					onOpenChange={setMetricOpen}
					content={
						<FilterMenu
							options={METRIC_OPTIONS}
							value={metric}
							onChange={(value) => onChangeMetric?.(value)}
							onClose={() => setMetricOpen(false)}
						/>
					}
					trigger="click"
					placement="bottomLeft"
					arrow={false}
					overlayClassName={classes.filterPopover}
				>
					<button type="button" className={classes.filterTrigger}>
						<span className={classes.filterTriggerLabel}>
							{selectedMetric?.triggerLabel}
						</span>
						<IconChevronDown size={16} className={classes.filterTriggerIcon} />
					</button>
				</Popover>

				<Popover
					open={periodOpen}
					onOpenChange={setPeriodOpen}
					content={
						<FilterMenu
							options={PERIOD_OPTIONS}
							value={period}
							onChange={(value) => onChangePeriod?.(value)}
							onClose={() => setPeriodOpen(false)}
						/>
					}
					trigger="click"
					placement="bottomLeft"
					arrow={false}
					overlayClassName={classes.filterPopover}
				>
					<button type="button" className={classes.filterTrigger}>
						<span className={classes.filterTriggerLabel}>
							{selectedPeriod?.triggerLabel}
						</span>
						<IconChevronDown size={16} className={classes.filterTriggerIcon} />
					</button>
				</Popover>
			</div>

			<ReferralLeaderboardPodium topInvitees={topHosts} loading={loading} />
			<ReferralLeaderboardList
				loading={loading}
				leaderBoard={leaderBoard}
				myPosition={myPosition}
				userData={userData}
			/>
		</div>
	)
}

export default memo(TalkRoomLeaderboard)
