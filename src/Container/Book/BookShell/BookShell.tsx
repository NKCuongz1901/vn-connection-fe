'use client'

import { memo } from 'react'
import clsx from 'clsx'
import { Tooltip } from 'antd'

import BookMiniPlayer from '@/Components/Book/BookMiniPlayer/BookMiniPlayer'
import { BookLanguageButton } from '@/Components/Book/BookLanguageModal/BookLanguageModal'
import { useBookLibrary } from '@/context/BookLibraryContext'
import { useOptionalBookPlayer } from '@/context/BookPlayerContext'
import { useLocalePath } from '@/ultis/route'
import { BOOK_LEVELS, BOOK_NAV, BOOK_ROOT } from '@/Variable/book.variable'

import classes from './BookShell.module.scss'

type BookShellProps = {
	children: React.ReactNode
}

function BookShell({ children }: BookShellProps) {
	const { onChangeRoute, pathname } = useLocalePath()
	const { level, setLevel, category, setCategory, categories } =
		useBookLibrary()
	const player = useOptionalBookPlayer()

	return (
		<div className={classes.shell}>
			<div className={classes.body}>
				<aside className={classes.sidebar}>
					<div className={classes.heading}>Audiobooks</div>
					<nav className={classes.nav}>
						{BOOK_NAV.map((item) => {
							const active =
								'href' in item &&
								item.href &&
								(pathname === item.href ||
									(item.id === 'overview' &&
										pathname.startsWith(BOOK_ROOT)))
							const button = (
								<button
									key={item.id}
									type="button"
									className={clsx(classes.navItem, {
										[classes.active]: active,
									})}
									disabled={'disabled' in item && item.disabled}
									onClick={() => {
										if ('href' in item && item.href) {
											onChangeRoute(item.href)
										}
									}}
								>
									{item.label}
								</button>
							)

							if ('disabled' in item && item.disabled) {
								return (
									<Tooltip
										key={item.id}
										title="Coming soon"
										color="green"
									>
										<span className={classes.navItemWrap}>
											{button}
										</span>
									</Tooltip>
								)
							}

							return button
						})}
					</nav>

					<div className={classes.sectionTitle}>Languages</div>
					<div className={classes.languageWrap}>
						<BookLanguageButton />
					</div>

					<div className={classes.sectionTitle}>Level</div>
					<div className={classes.levels}>
						{BOOK_LEVELS.map((item) => (
							<button
								key={item}
								type="button"
								className={clsx(classes.levelChip, {
									[classes.active]: level === item,
								})}
								onClick={() => setLevel(item)}
							>
								{item}
							</button>
						))}
					</div>

					<div className={classes.sectionTitle}>Category</div>
					<div className={classes.categories}>
						{categories.map((tag) => {
							const title = tag.title || ''
							return (
								<button
									key={tag.id || title}
									type="button"
									className={clsx(classes.tag, {
										[classes.active]: category === title,
									})}
									onClick={() => setCategory(title)}
								>
									{title}
								</button>
							)
						})}
					</div>
				</aside>
				<main
					className={clsx(classes.content, {
						[classes.withPlayer]: Boolean(player?.url),
					})}
				>
					{children}
				</main>
			</div>
			<BookMiniPlayer />
		</div>
	)
}

export default memo(BookShell)
