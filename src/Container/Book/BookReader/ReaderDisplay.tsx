'use client'

import { memo, useCallback, useEffect, useState } from 'react'
import { IconMinus, IconPlus, IconTypography } from '@tabler/icons-react'
import { Popover } from 'antd'
import clsx from 'clsx'

import classes from './BookReader.module.scss'

export type ReaderTheme = 'light' | 'sepia' | 'green' | 'dark'

export type ReaderDisplaySettings = {
	theme: ReaderTheme
	fontSize: number
}

// Page colours from the Figma "Display" panel
export const READER_THEMES: { id: ReaderTheme; label: string; swatch: string }[] = [
	{ id: 'light', label: 'Light', swatch: '#ffffff' },
	{ id: 'sepia', label: 'Sepia', swatch: '#f6efe0' },
	{ id: 'green', label: 'Dark green', swatch: '#0c2b2b' },
	{ id: 'dark', label: 'Dark', swatch: '#141414' },
]

const STORAGE_KEY = 'book-reader-display'
const MIN_SIZE = 14
const MAX_SIZE = 28
const DEFAULTS: ReaderDisplaySettings = { theme: 'light', fontSize: 18 }

/** Reader display settings kept per browser (a convenience, not synced) */
export function useReaderDisplay() {
	const [settings, setSettings] = useState<ReaderDisplaySettings>(DEFAULTS)

	useEffect(() => {
		try {
			const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null')
			if (saved && READER_THEMES.some((item) => item.id === saved.theme)) {
				setSettings({
					theme: saved.theme,
					fontSize: Math.min(MAX_SIZE, Math.max(MIN_SIZE, Number(saved.fontSize) || DEFAULTS.fontSize)),
				})
			}
		} catch {
			// storage blocked: keep defaults
		}
	}, [])

	const update = useCallback((patch: Partial<ReaderDisplaySettings>) => {
		setSettings((prev) => {
			const next = { ...prev, ...patch }
			try {
				window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
			} catch {
				// storage blocked: the change still applies to this visit
			}
			return next
		})
	}, [])

	return { settings, update }
}

type ReaderDisplayProps = {
	settings: ReaderDisplaySettings
	onChange: (patch: Partial<ReaderDisplaySettings>) => void
}

function ReaderDisplay({ settings, onChange }: ReaderDisplayProps) {
	const content = (
		<div className={classes.display}>
			<div className={classes.displayLabel}>Background</div>
			<div className={classes.swatches}>
				{READER_THEMES.map((item) => (
					<button
						key={item.id}
						type="button"
						className={clsx(classes.swatch, {
							[classes.swatchActive]: settings.theme === item.id,
						})}
						style={{ background: item.swatch }}
						onClick={() => onChange({ theme: item.id })}
						aria-label={item.label}
						aria-pressed={settings.theme === item.id}
					/>
				))}
			</div>
			<div className={classes.displayRow}>
				<span className={classes.displayLabel}>Font size</span>
				<span className={classes.sizeControl}>
					<button
						type="button"
						onClick={() => onChange({ fontSize: Math.max(MIN_SIZE, settings.fontSize - 1) })}
						disabled={settings.fontSize <= MIN_SIZE}
						aria-label="Smaller text"
					>
						<IconMinus size={14} />
					</button>
					<span>{settings.fontSize} pt</span>
					<button
						type="button"
						onClick={() => onChange({ fontSize: Math.min(MAX_SIZE, settings.fontSize + 1) })}
						disabled={settings.fontSize >= MAX_SIZE}
						aria-label="Larger text"
					>
						<IconPlus size={14} />
					</button>
				</span>
			</div>
		</div>
	)

	return (
		<Popover content={content} trigger="click" placement="bottomRight" title="Display">
			<button type="button" className={classes.mode} aria-label="Display settings">
				<IconTypography size={16} />
			</button>
		</Popover>
	)
}

export default memo(ReaderDisplay)
