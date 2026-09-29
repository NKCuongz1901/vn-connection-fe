'use client'

import { memo, useEffect, useMemo, useState } from 'react'
import { Tooltip } from 'antd'
import { IconX } from '@tabler/icons-react'

import CButton from '@/Components/Custom/CButton'
import CModal from '@/Components/Custom/CModal/CModal'
import LockIcon from '@/svg/LockIcon'
import TickCircleIcon from '@/svg/TickCircleIcon'
import { OVERVIEW_GUEST_CHAT_ROOMS } from '@/Variable/overviewGuestChatRooms.variable'

import classes from './CourseLanguageModal.module.scss'

type CourseLanguageModalProps = {
	open: boolean
	onClose: () => void
	supportedLanguage?: string[]
	initialSelectedCode?: string
	onConfirm: (code: string) => void
}

const LANGUAGE_LABEL: Record<string, string> = {
	zh: 'Chinese (Mandarin)',
}

const LOCKED_TOOLTIP =
	"The course isn't available\nin your language yet. \nPlease check back later!"

const normalizeLang = (code?: string) =>
	(code || '').toLowerCase().split('-')[0]

const getLanguageLabel = (code: string, name: string) =>
	LANGUAGE_LABEL[normalizeLang(code)] || name

/** Picks a course learning language from the local guest language list. */
function CourseLanguageModal({
	open,
	onClose,
	supportedLanguage = [],
	initialSelectedCode = '',
	onConfirm,
}: CourseLanguageModalProps) {
	const [selectedCode, setSelectedCode] = useState(initialSelectedCode)
	const supportedSet = useMemo(
		() => new Set((supportedLanguage || []).map(normalizeLang).filter(Boolean)),
		[supportedLanguage],
	)

	useEffect(() => {
		if (!open) return
		setSelectedCode(initialSelectedCode)
	}, [initialSelectedCode, open])

	const canConfirm = Boolean(
		selectedCode && supportedSet.has(normalizeLang(selectedCode)),
	)

	const handleConfirm = () => {
		if (!canConfirm) return
		onConfirm(selectedCode)
	}

	if (!open) return null

	return (
		<CModal
			closable={false}
			footer={null}
			title={null}
			onCancel={onClose}
			styles={{
				content: {
					width: 400,
					maxWidth: 'calc(100vw - 32px)',
					padding: 0,
					borderRadius: 24,
					overflow: 'hidden',
					minHeight: 'auto',
					maxHeight: 'none',
				},
				body: {
					padding: 0,
					overflow: 'hidden',
				},
			}}
		>
			<div className={classes.panel}>
				<div className={classes.header}>
					<p className={classes.title}>Choose Your Learning Language</p>
					<button
						type="button"
						className={classes.closeBtn}
						onClick={onClose}
						aria-label="Close"
					>
						<IconX size={20} stroke={1.5} color="#0f1729" />
					</button>
					<div className={classes.divider} />
				</div>

				<div className={classes.list}>
					{OVERVIEW_GUEST_CHAT_ROOMS.map((item) => {
						const code = item.code || ''
						const locked = !supportedSet.has(normalizeLang(code))
						const selected = normalizeLang(selectedCode) === normalizeLang(code)
						const label = getLanguageLabel(code, item.name)

						const row = (
							<button
								key={item.id || code}
								type="button"
								className={`${classes.item} ${locked ? classes.itemLocked : ''} ${
									selected ? classes.itemSelected : ''
								}`}
								onClick={() => {
									if (locked) return
									setSelectedCode(selected ? '' : code)
								}}
							>
								<span className={classes.itemInfo}>
									<span className={classes.flagWrap}>
										{item.flag ? (
											<img src={item.flag} alt="" className={classes.flag} />
										) : (
											<span className={classes.flagFallback}>
												{code.slice(0, 2).toUpperCase()}
											</span>
										)}
									</span>
									<span
										className={locked ? classes.lockedLabel : classes.label}
									>
										{label}
									</span>
								</span>
								<span className={classes.iconWrap}>
									{locked ? (
										<LockIcon width={20} height={20} />
									) : (
										<TickCircleIcon
											width={24}
											height={24}
											fill={selected ? '#006b35' : '#48546B'}
										/>
									)}
								</span>
							</button>
						)

						if (!locked) return row

						return (
							<Tooltip
								key={item.id || code}
								title={LOCKED_TOOLTIP}
								placement="top"
								overlayClassName={classes.tooltip}
								overlayInnerStyle={{
									maxWidth: 250,
									padding: '12px 16px',
									border: '1px solid #edf0f5',
									borderRadius: 16,
									background: '#fff',
									boxShadow: '0 0 16px rgba(0, 8, 25, 0.08)',
									color: '#0f1729',
									fontSize: 14,
									fontWeight: 400,
									lineHeight: '20px',
									whiteSpace: 'pre-line',
								}}
							>
								{row}
							</Tooltip>
						)
					})}
				</div>

				<div className={classes.footer}>
					<CButton
						disabled={!canConfirm}
						onClick={handleConfirm}
						ctype="oranger"
						style={{ width: '100%' }}
					>
						Confirm
					</CButton>
				</div>
			</div>
		</CModal>
	)
}

export default memo(CourseLanguageModal)
