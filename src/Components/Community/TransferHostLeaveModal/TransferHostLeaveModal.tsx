'use client'

import { CloseOutlined } from '@ant-design/icons'
import { Flex, Spin } from 'antd'
import clsx from 'clsx'
import { memo, useCallback, useEffect, useRef, useState } from 'react'

import { getConvMembersById } from '@/apis/conversationApis'
import CAvatar from '@/Components/Custom/CAvatar'
import CButton from '@/Components/Custom/CButton'
import CModal from '@/Components/Custom/CModal/CModal'
import { useModal } from '@/context/ModalContext'
import { ClubMemberProps } from '@/interface/Community/Community.interface'
import { isArray } from '@/ultis/array'
import SearchNormal from '@/svg/SearchNormal'

import classes from './TransferHostLeaveModal.module.scss'

export type TransferHostCandidate = {
	userId: string
	name: string
	avatar?: string
	isAdmin?: boolean
}

interface TransferHostLeaveModalProps {
	open: boolean
	conversationId: string
	loading?: boolean
	onClose: () => void
	onContinue: (memberId: string) => void | Promise<void>
}

/** Maps API member rows to transfer-host candidates (skip current owner). */
const mapCandidates = (rows: ClubMemberProps[] = []): TransferHostCandidate[] =>
	rows
		.filter((item) => item?.type !== 'OWNER' && item?.user_id)
		.map((item) => ({
			userId: item.user_id,
			name: item?.user?.name || '',
			avatar: item?.user?.avatar,
			isAdmin: item?.type === 'ADMIN',
		}))

/** Owner leave modal: pick a member to receive host before leaving. */
function TransferHostLeaveModal({
	open,
	conversationId,
	loading = false,
	onClose,
	onContinue,
}: TransferHostLeaveModalProps) {
	const { openError } = useModal()
	const [search, setSearch] = useState('')
	const [selectedId, setSelectedId] = useState('')
	const [candidates, setCandidates] = useState<TransferHostCandidate[]>([])
	const [total, setTotal] = useState(0)
	const [loadingList, setLoadingList] = useState(false)
	const [loadingMore, setLoadingMore] = useState(false)
	const pageRef = useRef(1)
	const hasMoreRef = useRef(false)
	const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const skipSearchEffectRef = useRef(true)

	/** Loads candidates from GET /conversation/{id}/members. */
	const loadCandidates = useCallback(
		async ({
			keyword = '',
			page = 1,
			append = false,
		}: {
			keyword?: string
			page?: number
			append?: boolean
		} = {}) => {
			if (!conversationId) return
			if (append) setLoadingMore(true)
			else setLoadingList(true)

			try {
				const memberRes: any = await getConvMembersById({
					id: conversationId,
					page,
					limit: 20,
					...(keyword ? { name: keyword } : {}),
				})
				const rows = memberRes?.results?.objects?.rows || []
				const mapped = mapCandidates(rows)
				const totalMembers =
					memberRes?.results?.objects?.count ||
					memberRes?.results?.objects?.total ||
					mapped.length

				setCandidates((prev) => (append ? [...prev, ...mapped] : mapped))
				setTotal(totalMembers)
				pageRef.current = page
				hasMoreRef.current = isArray(rows, 20)
			} catch (error) {
				openError(error)
			} finally {
				setLoadingList(false)
				setLoadingMore(false)
			}
		},
		[conversationId, openError],
	)

	useEffect(() => {
		if (!open) return
		skipSearchEffectRef.current = true
		setSearch('')
		setSelectedId('')
		setCandidates([])
		pageRef.current = 1
		loadCandidates({ page: 1 })
	}, [open, conversationId, loadCandidates])

	useEffect(() => {
		if (!open) return
		if (skipSearchEffectRef.current) {
			skipSearchEffectRef.current = false
			return
		}
		if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
		searchTimerRef.current = setTimeout(() => {
			loadCandidates({
				keyword: search.trim(),
				page: 1,
			})
		}, 350)
		return () => {
			if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
		}
	}, [search, open, loadCandidates])

	const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
		if (!hasMoreRef.current || loadingMore || loadingList) return
		const el = e.currentTarget
		if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
			loadCandidates({
				keyword: search.trim(),
				page: pageRef.current + 1,
				append: true,
			})
		}
	}

	const handleContinue = () => {
		if (!selectedId) {
			openError({ message: 'Please select a member to leave' })
			return
		}
		onContinue(selectedId)
	}

	if (!open) return null

	return (
		<CModal
			open
			centered
			closable={false}
			footer={null}
			onCancel={loading ? undefined : onClose}
			styles={{
				content: {
					width: 480,
					maxWidth: 'calc(100vw - 32px)',
					padding: 0,
					borderRadius: 8,
					overflow: 'hidden',
					maxHeight: '80vh',
					minHeight: 0,
				},
				body: {
					padding: 0,
					overflow: 'hidden',
					display: 'flex',
					flexDirection: 'column',
					maxHeight: '80vh',
				},
			}}
		>
			<div className={classes.wrapper}>
				<div className={classes.header}>
					<h2 className={classes.title}>Transfer admin role</h2>
					<button
						type="button"
						className={classes.closeBtn}
						disabled={loading}
						onClick={onClose}
						aria-label="Close"
					>
						<CloseOutlined />
					</button>
				</div>

				<p className={classes.subtitle}>
					Select a member to become the new admin.
				</p>

				<div className={classes.sectionHead}>
					<span className={classes.sectionTitle}>Members</span>
					<span className={classes.badge}>{total}</span>
				</div>

				<div className={classes.searchWrap}>
					<span className={classes.searchIcon}>
						<SearchNormal fill="#7987A4" />
					</span>
					<input
						className={classes.searchInput}
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search name"
						disabled={loading}
					/>
				</div>

				<div className={classes.list} onScroll={handleScroll}>
					{loadingList && !isArray(candidates, 1) ? (
						<Flex justify="center" align="center" className={classes.loadingBox}>
							<Spin />
						</Flex>
					) : !isArray(candidates, 1) ? (
						<p className={classes.empty}>No members found</p>
					) : (
						candidates.map((item) => {
							const selected = selectedId === item.userId
							return (
								<button
									key={item.userId}
									type="button"
									className={classes.row}
									disabled={loading}
									onClick={() => setSelectedId(item.userId)}
								>
									<span
										className={clsx(classes.radio, {
											[classes.radioChecked]: selected,
										})}
										aria-hidden
									/>
									<CAvatar src={item.avatar} size={40} />
									<span className={classes.name}>
										{item.name}
										{item.isAdmin ? (
											<span className={classes.coAdmin}> (co-admin)</span>
										) : null}
									</span>
								</button>
							)
						})
					)}
					{loadingMore && (
						<Flex justify="center" className={classes.loadingMore}>
							<Spin size="small" />
						</Flex>
					)}
				</div>

				<div className={classes.footer}>
					<CButton
						ctype="disabled"
						style={{ flex: 1 }}
						disabled={loading}
						onClick={onClose}
					>
						Cancel
					</CButton>
					<CButton
						ctype={!selectedId || loading ? null : 'oranger'}
						style={{ flex: 1 }}
						disabled={!selectedId || loading}
						onClick={handleContinue}
					>
						{loading ? <Spin size="small" /> : 'Continue'}
					</CButton>
				</div>
			</div>
		</CModal>
	)
}

export default memo(TransferHostLeaveModal)
