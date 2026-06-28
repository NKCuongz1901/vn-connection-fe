'use client'

import { IconX } from '@tabler/icons-react'
import { Skeleton } from 'antd'
import clsx from 'clsx'
import { memo, useMemo } from 'react'

import CModal from '@/Components/Custom/CModal/CModal'
import EmptyConnectionIcon from '@/svg/Talkroom/EmptyConnectionIcon'
import { getTalkRoomCountryName } from '@/ultis/talkRoom'
import { mappingFlag } from '@/Variable/countryVariable'

import classes from './TalkRoomConnectedCountryModal.module.scss'

export interface TalkRoomConnectedCountryModalProps {
	open: boolean
	onClose: () => void
	countries: string[]
	loading?: boolean
	onCreateRoom?: () => void
}

function TalkRoomConnectedCountryModal({
	open,
	onClose,
	countries,
	loading = false,
	onCreateRoom,
}: TalkRoomConnectedCountryModalProps) {
	const hasCountries = countries.length > 0
	const isEmpty = !loading && !hasCountries
	const displayTotal = countries.length

	const description = useMemo(
		() =>
			`Amazing! You've connected with ${displayTotal} ${
				displayTotal === 1 ? 'country' : 'countries'
			} in this talk room. 🎉`,
		[displayTotal],
	)

	if (!open) return null

	const renderCountry = (code: string) => (
		<div key={code} className={classes.countryItem}>
			<div
				className={clsx(
					classes.flagCircle,
					`flag:${mappingFlag[code] || code}`,
				)}
			/>
			<span className={classes.countryName}>
				{getTalkRoomCountryName(code)}
			</span>
		</div>
	)

	const renderSkeleton = () => (
		<div className={classes.skeletonGrid}>
			{Array.from({ length: 10 }).map((_, index) => (
				<div key={index} className={classes.skeletonItem}>
					<Skeleton.Avatar active className={classes.skeletonFlag} />
					<Skeleton.Input active className={classes.skeletonLine} />
				</div>
			))}
		</div>
	)

	const renderEmptyState = () => (
		<div className={classes.emptyState}>
			<div className={classes.emptyInfo}>
				<div className={classes.emptyIcon}>
					<EmptyConnectionIcon width={120} height={99} />
				</div>
				<div className={classes.emptyContent}>
					<h3 className={classes.emptyTitle}>No connections yet</h3>
					<p className={classes.emptyDescription}>
						Start a new talk room and be the first to connect with someone!
					</p>
				</div>
			</div>
			<button
				type="button"
				className={classes.createRoomBtn}
				onClick={onCreateRoom}
			>
				Create room
			</button>
		</div>
	)

	const renderSimpleHeader = () => (
		<div className={classes.simpleHeader}>
			<h2 className={classes.simpleTitle}>Countries connected</h2>
			<button
				type="button"
				className={classes.simpleCloseBtn}
				onClick={onClose}
				aria-label="Close"
			>
				<IconX size={16} />
			</button>
		</div>
	)

	const renderFilledHeader = () => (
		<div className={classes.header}>
			<button
				type="button"
				className={classes.closeBtn}
				onClick={onClose}
				aria-label="Close"
			>
				<IconX size={16} />
			</button>
			<h2 className={classes.title}>
				<span className={classes.titleCount}>{displayTotal}</span>
				{` Countries connected`}
			</h2>
			<p className={classes.description}>{description}</p>
		</div>
	)

	return (
		<CModal
			open
			centered
			closable={false}
			footer={null}
			onCancel={onClose}
			styles={{
				content: {
					width: isEmpty ? 660 : 692,
					maxWidth: 'calc(100vw - 32px)',
					height: '70vh',
					padding: 0,
					borderRadius: 8,
					overflow: 'hidden',
				},
				body: {
					padding: 0,
				},
			}}
		>
			<div
				className={clsx(classes.wrapper, {
					[classes.wrapperEmpty]: isEmpty,
				})}
			>
				{isEmpty || (loading && !hasCountries)
					? renderSimpleHeader()
					: renderFilledHeader()}

				{!isEmpty && <div className={classes.divider} />}

				<div
					className={clsx(classes.body, {
						[classes.bodyEmpty]: isEmpty,
					})}
				>
					{loading && !hasCountries ? (
						renderSkeleton()
					) : isEmpty ? (
						renderEmptyState()
					) : (
						<div className={classes.grid}>
							{countries.map((code) => renderCountry(code))}
						</div>
					)}
				</div>
			</div>
		</CModal>
	)
}

export default memo(TalkRoomConnectedCountryModal)
