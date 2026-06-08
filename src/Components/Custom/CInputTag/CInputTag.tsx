'use client'

import { Flex, Skeleton } from 'antd'
import clsx from 'clsx'
import { cloneDeep } from 'lodash'
import {
	forwardRef,
	memo,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from 'react'
import { Mention, MentionsInput } from 'react-mentions'

import { getMemberInConv, getQuickMessage } from '@/apis/conversationApis'

import { arrayFrom, isArray, uniqueArray } from '@/ultis/array'
import { handleScrollCallback } from '@/ultis/common'

import People from '@/svg/People'
import CAvatar from '../CAvatar'

import { QuickMessageListItem } from '@/Components/Modal/QuickMesageModal/QuickMessageListView'
import { QuickMessageItem } from '@/hooks/QuickMesage/useQuickMessage'

import { PaginationType } from '@/interface/common/common.interface'
import { optionFriends, paginationCommon } from '@/Variable/common.variable'

import { CInputProps } from '@/interface/CComponent/CComponent.interface'

import classes from './CInputTag.module.scss'
import './CInputTag.scss'
import { getFriends } from '@/apis/friendApis'

interface MentionUser {
	id: string
	display: string
	avatar?: string
}

interface CInputTagProps {
	id?: string
	disabled?: boolean
	value?: string
	onChange?: any
	onSendMessage?: any
	suffix?: any
	source?: 'conversation' | 'comment'
	mentionData?: MentionUser[]
	onQuickMessageSelect?: (item: QuickMessageItem) => void
}

const defaultUser = {
	id: 'allg7pQm2aKtx',
	display: 'all',
	avatar: '',
}

const getQuickMessageQuery = (plainText: string, cursorPos: number) => {
	for (let i = cursorPos - 1; i >= 0; i--) {
		if (plainText[i] === '/') {
			const query = plainText.slice(i + 1, cursorPos)
			if (/^[a-zA-Z]*$/.test(query)) {
				return { start: i, query }
			}
			return null
		}
		if (plainText[i] === ' ' || plainText[i] === '\n') break
	}
	return null
}

const CInputTag = forwardRef((_props: CInputTagProps, ref: any) => {
	const {
		id,
		disabled,
		suffix,
		onChange,
		onSendMessage,
		value = '',
		source = 'conversation',
		mentionData,
		onQuickMessageSelect,
	} = _props

	const debounceRef = useRef<any>(null)
	const quickMessageDebounceRef = useRef<any>(null)
	const quickMessageSearchTokenRef = useRef(0)
	const slashInfoRef = useRef<{ start: number; query: string } | null>(null)
	const searchTokenRef = useRef(0)
	const pagination = useRef<PaginationType>(cloneDeep(paginationCommon))
	const loadMore = useRef(true)
	const latestSearchRef = useRef('')
	const inputRef = useRef<any>(null)
	const containerRef = useRef<any>(null)
	const mentionCallbackRef = useRef<((data: any[]) => void) | null>(null)

	const [openMention, setOpenMention] = useState(false)
	const [loading, setLoading] = useState(false)
	const [users, setUsers] = useState<any[]>([])
	const [openQuickMessage, setOpenQuickMessage] = useState(false)
	const [quickMessageLoading, setQuickMessageLoading] = useState(false)
	const [quickMessageList, setQuickMessageList] = useState<QuickMessageItem[]>([])
	const [focusedQuickMessageIndex, setFocusedQuickMessageIndex] = useState(0)

	useImperativeHandle(ref, () => inputRef.current, [])

	const hasPendingMention = (_plainText: string, markupText: string) => {
		const validMentionRegex = /@\[[^\]]+\]\([^)]+\)/g
		const markupWithoutValidMentions = String(markupText || '').replace(
			validMentionRegex,
			'',
		)

		return /(^|\s)@([^\s@]*)$/i.test(markupWithoutValidMentions)
	}

	const isMentionSuggestionOpen = () => {
		const container = containerRef.current
		if (!container) return false

		const suggestionList = container.querySelector(
			'.mentionsInput__suggestions',
		)

		return !!suggestionList
	}

	const mapUsers = (
		rows: any[] = [],
		sourceType: 'conversation' | 'comment',
	) => {
		if (sourceType === 'comment') {
			return rows
				.map((i: any) => {
					const friend = i?.friend
					return {
						id: friend?.id,
						avatar: friend?.avatar,
						display: friend?.name,
					}
				})
				.filter((i) => !!i.id && !!i.display)
		}

		return rows
			.map((i: any) => ({
				id: i.user_id,
				avatar: i?.user?.avatar,
				display: i?.user?.name,
			}))
			.filter((i) => !!i.id && !!i.display)
	}

	const emitSuggestions = (list: any[]) => {
		mentionCallbackRef.current?.(uniqueArray([defaultUser, ...list], 'id'))
	}

	const fetchMentionUsers = async ({
		search,
		page,
		append = false,
	}: {
		search: string
		page: number
		append?: boolean
	}) => {
		const currentToken = ++searchTokenRef.current

		setLoading(true)
		try {
			const { limit } = pagination.current
			let res: any

			if (source === 'comment') {
				res = await getFriends({
					params: {
						type: optionFriends[0].value,
						fields: ['$all'],
						where: {
							name: search || '',
						},
						page,
						limit,
					},
				})
			} else {
				res = await getMemberInConv({
					id,
					name: search,
					page,
					limit,
				})
			}

			if (currentToken !== searchTokenRef.current) return

			const rows = res?.results?.objects?.rows || []
			const mapped = mapUsers(rows, source)

			loadMore.current = isArray(rows, limit)

			setUsers((prev) => {
				const nextUsers = append ? [...(prev || []), ...mapped] : mapped
				const uniqueUsers = uniqueArray(nextUsers, 'id')
				emitSuggestions(uniqueUsers)
				return uniqueUsers
			})
		} catch (error) {
			console.log('fetchMentionUsers', error)
			if (!append) {
				setUsers([])
				emitSuggestions([])
			}
		} finally {
			if (currentToken === searchTokenRef.current) {
				setLoading(false)
			}
		}
	}

	const searchMentionUsers = (
		search: string,
		callback: (data: any[]) => void,
	) => {
		setOpenMention(true)
		mentionCallbackRef.current = callback
		latestSearchRef.current = search

		if (debounceRef.current) {
			clearTimeout(debounceRef.current)
		}

		pagination.current.page = 1

		if (isArray(mentionData, 1)) {
			const keyword = (search || '').trim().toLowerCase()
			const filtered = keyword
				? mentionData.filter((u) =>
						u.display?.toLowerCase().includes(keyword),
					)
				: mentionData
			loadMore.current = false
			setUsers(filtered)
			emitSuggestions(filtered)
			setLoading(false)
			return
		}

		// Hiện tạm @all ngay để dropdown mở lập tức
		callback([defaultUser])

		debounceRef.current = setTimeout(() => {
			fetchMentionUsers({
				search,
				page: 1,
				append: false,
			})
		}, 300)
	}

	const handleLoadMore = async () => {
		if (!loadMore.current || loading) return
		if (!openMention) return

		const { limit } = pagination.current
		const currentPage = Math.trunc((users || []).length / limit)
		const nextPage = currentPage + 1

		pagination.current.page = nextPage

		await fetchMentionUsers({
			search: latestSearchRef.current,
			page: nextPage,
			append: true,
		})
	}

	const handleScroll = (e: any) => {
		handleScrollCallback(e, handleLoadMore)
	}

	const buildMapping = (plain: string, markup: string) => {
		const map: number[] = []
		let iPlain = 0
		let iMarkup = 0

		while (iPlain < plain.length && iMarkup < markup.length) {
			if (markup[iMarkup] === '@' && markup[iMarkup + 1] === '[') {
				const closeBracket = markup.indexOf(']', iMarkup + 2)
				const openParen = markup.indexOf('(', closeBracket + 1)
				const closeParen = markup.indexOf(')', openParen + 1)

				if (closeBracket === -1 || openParen === -1 || closeParen === -1) {
					map[iPlain++] = iMarkup++
					continue
				}

				const display = markup.slice(iMarkup + 2, closeBracket)

				map[iPlain++] = iMarkup

				for (let k = 0; k < display.length; k++) {
					map[iPlain++] = iMarkup + 2 + k
				}

				iMarkup = closeParen + 1
				continue
			}

			map[iPlain++] = iMarkup++
		}

		while (iPlain < plain.length) {
			map[iPlain++] = iMarkup
		}

		return map
	}

	const fetchQuickMessages = async (query: string) => {
		const currentToken = ++quickMessageSearchTokenRef.current
		setQuickMessageLoading(true)
		try {
			const res: any = await getQuickMessage({
				params: {
					fields: ['$all'],
					page: 1,
					limit: 20,
					...(query ? { shortcut: query } : {}),
				},
			})
			if (currentToken !== quickMessageSearchTokenRef.current) return

			const rows = res?.results?.objects?.rows || []
			setQuickMessageList(rows)
			setFocusedQuickMessageIndex(0)
		} catch (error) {
			console.log('fetchQuickMessages', error)
			if (currentToken === quickMessageSearchTokenRef.current) {
				setQuickMessageList([])
			}
		} finally {
			if (currentToken === quickMessageSearchTokenRef.current) {
				setQuickMessageLoading(false)
			}
		}
	}

	const searchQuickMessages = (query: string) => {
		if (quickMessageDebounceRef.current) {
			clearTimeout(quickMessageDebounceRef.current)
		}

		quickMessageDebounceRef.current = setTimeout(() => {
			fetchQuickMessages(query)
		}, 200)
	}

	const removeSlashQueryFromValue = (
		plain: string,
		markup: string,
		startPlain: number,
		endPlain: number,
	) => {
		const map = buildMapping(plain, markup)
		const startMarkup = map[startPlain] ?? 0
		const endMarkup = map[endPlain] ?? markup.length
		return markup.slice(0, startMarkup) + markup.slice(endMarkup)
	}

	const handleSelectQuickMessage = (item: QuickMessageItem) => {
		const el = inputRef.current
		const plain = el?.value || ''
		const cursorPos = el?.selectionStart ?? plain.length
		const slashInfo =
			slashInfoRef.current || getQuickMessageQuery(plain, cursorPos)

		if (slashInfo) {
			const newMarkup = removeSlashQueryFromValue(
				plain,
				value || '',
				slashInfo.start,
				cursorPos,
			)
			onChange?.({ target: { value: newMarkup } })
		}

		setOpenQuickMessage(false)
		slashInfoRef.current = null
		setQuickMessageList([])
		onQuickMessageSelect?.(item)
	}

	const handleMentionsChange = (
		event: any,
		_newValue: string,
		newPlainTextValue: string,
	) => {
		onChange?.(event)

		if (source !== 'conversation' || !onQuickMessageSelect) return

		const el = inputRef.current
		const cursorPos = el?.selectionStart ?? newPlainTextValue.length
		const slashInfo = getQuickMessageQuery(newPlainTextValue, cursorPos)

		if (slashInfo) {
			slashInfoRef.current = slashInfo
			setOpenQuickMessage(true)
			searchQuickMessages(slashInfo.query)
			return
		}

		setOpenQuickMessage(false)
		slashInfoRef.current = null
		setQuickMessageList([])
	}

	const handleChangeValue = (item: any) => {
		const el = inputRef.current
		if (!el) return

		const cursorPos = el.selectionStart
		const plain = el.value || ''
		const markup = value || ''

		let atPosPlain = -1
		for (let i = cursorPos - 1; i >= 0; i--) {
			if (plain[i] === '@') {
				atPosPlain = i
				break
			}
			if (plain[i] === ' ' || plain[i] === '\n') break
		}

		if (atPosPlain === -1) return

		const map = buildMapping(plain, markup)
		const atPosMarkup = map[atPosPlain]
		const cursorMarkup = map[cursorPos] ?? markup.length

		const newMention = `@[${item.display}](${item.id})`
		const newMarkup =
			markup.slice(0, atPosMarkup) + newMention + markup.slice(cursorMarkup)

		onChange?.({ target: { value: newMarkup } })

		const newCaretPos = atPosPlain + 1 + item.display.length

		requestAnimationFrame(() => {
			el.focus()
			el.setSelectionRange(newCaretPos, newCaretPos)
		})

		setOpenMention(false)
	}

	const focusToPosition = (pos: number) => {
		const el = inputRef.current
		if (!el) return
		el.focus()
		el.setSelectionRange(pos, pos)
	}

	const getClickedMentionIndex = (targetNode: any) => {
		const highlighter = containerRef.current?.querySelector(
			'.mentionsInput__highlighter',
		)
		if (!highlighter) return -1

		let pos = 0

		for (const node of highlighter.childNodes) {
			if (node === targetNode) {
				return pos
			}

			if ((node as any).classList?.contains('mention')) {
				pos += node.textContent.length
				continue
			}

			pos += node.textContent.length
		}

		return -1
	}

	const handleMentionClick = (node: any) => {
		const startPos = getClickedMentionIndex(node)
		if (startPos === -1) return

		const mentionText = node.textContent || ''
		const caretPos = startPos + mentionText.length

		focusToPosition(caretPos)
	}

	const handleKeyDown = (e: any) => {
		if (openQuickMessage) {
			if (e.key === 'ArrowDown' && quickMessageList.length > 0) {
				e.preventDefault()
				setFocusedQuickMessageIndex((prev) =>
					prev >= quickMessageList.length - 1 ? 0 : prev + 1,
				)
				return
			}
			if (e.key === 'ArrowUp' && quickMessageList.length > 0) {
				e.preventDefault()
				setFocusedQuickMessageIndex((prev) =>
					prev <= 0 ? quickMessageList.length - 1 : prev - 1,
				)
				return
			}
			if (e.key === 'Enter') {
				e.preventDefault()
				e.stopPropagation()
				if (quickMessageList.length > 0) {
					handleSelectQuickMessage(quickMessageList[focusedQuickMessageIndex])
				}
				return
			}
		}

		if (e.key === 'Escape' && openQuickMessage) {
			e.preventDefault()
			setOpenQuickMessage(false)
			slashInfoRef.current = null
			return
		}

		if (e.key !== 'Enter') return

		if (e.shiftKey) return

		const inputValue = e.target?.value || ''
		const pendingMention = hasPendingMention(inputValue, value || '')
		const suggestionOpen = isMentionSuggestionOpen()

		if (suggestionOpen || (openMention && pendingMention) || openQuickMessage) {
			return
		}

		if (pendingMention) {
			e.preventDefault()
			e.stopPropagation()
			return
		}

		e.preventDefault()
		e.stopPropagation()
		onSendMessage?.(e)
	}

	const renderMentionSuggestion = (
		entry: any,
		_search: string,
		_highlightedDisplay: React.ReactNode,
		_index: number,
		focused: boolean,
	) => {
		const { id, avatar, display } = entry || {}
		const isAll = id === defaultUser.id

		return (
			<Flex
				className={clsx(classes.mentionSuggestItem, {
					[classes.activeMentionSuggestItem]: focused,
				})}
			>
				<div className={classes.avatar}>
					{isAll ? <People /> : <CAvatar src={avatar} size={24} />}
				</div>
				{isAll && '@'}
				{display}
			</Flex>
		)
	}

	const renderCustomSuggestionsContainer = (children: React.ReactNode) => {
		if (!openMention) return children

		return (
			<Flex
				vertical
				className={classes.wrapperMentionSuggest}
				onScroll={handleScroll}
			>
				{children}
				{loading && (
					<Flex vertical className={classes.skeletonWrapper}>
						{arrayFrom(3).map((_, index) => (
							<div key={index} className={classes.skeleton}>
								<Skeleton.Input active />
							</div>
						))}
					</Flex>
				)}
			</Flex>
		)
	}

	useEffect(() => {
		const highlighter = containerRef.current?.querySelector(
			'.mentionsInput__highlighter',
		)
		if (!highlighter) return

		const onClick = (e: any) => {
			if (e.target?.classList?.contains('mention')) {
				handleMentionClick(e.target)
			}
		}

		highlighter.addEventListener('click', onClick)
		return () => {
			highlighter.removeEventListener('click', onClick)
		}
	}, [value])

	useEffect(() => {
		return () => {
			if (debounceRef.current) {
				clearTimeout(debounceRef.current)
			}
			if (quickMessageDebounceRef.current) {
				clearTimeout(quickMessageDebounceRef.current)
			}
		}
	}, [])

	return (
		<div
			className={clsx(classes.layout, 'mentionsInput', {
				[classes.disabled]: disabled,
			})}
			ref={containerRef}
		>
			<MentionsInput
				readOnly={disabled}
				inputRef={inputRef}
				placeholder="Text message"
				value={value}
				onChange={handleMentionsChange}
				onKeyDown={handleKeyDown}
				allowSpaceInQuery={true}
				a11ySuggestionsListLabel="Suggested mentions"
				className="mentionsInput"
				customSuggestionsContainer={(children) =>
					renderCustomSuggestionsContainer(children)
				}
			>
				<Mention
					trigger="@"
					className="mention"
					data={(search, callback) => {
						searchMentionUsers(search, callback)
					}}
					renderSuggestion={renderMentionSuggestion}
					onAdd={(addedId, addedDisplay) => {
						setOpenMention(false)
						handleChangeValue({
							id: addedId,
							display: addedDisplay,
						})
					}}
					displayTransform={(_id, display) => `@${display}`}
				/>
			</MentionsInput>

			{openQuickMessage && onQuickMessageSelect && (
				<div className={classes.wrapperQuickMessageSuggest}>
					{quickMessageLoading &&
						arrayFrom(3).map((_, index) => (
							<div key={index} className={classes.quickMessageSkeleton}>
								<Skeleton.Input active block />
							</div>
						))}
					{!quickMessageLoading &&
						quickMessageList.map((item, index) => (
							<QuickMessageListItem
								key={item.id}
								item={item}
								mode="pick"
								size="compact"
								active={index === focusedQuickMessageIndex}
								showDivider={index < quickMessageList.length - 1}
								onMouseDown={(e) => {
									e.preventDefault()
									handleSelectQuickMessage(item)
								}}
								onMouseEnter={() => setFocusedQuickMessageIndex(index)}
							/>
						))}
					{!quickMessageLoading && quickMessageList.length === 0 && (
						<div className={classes.quickMessageEmpty}>
							No quick messages found
						</div>
					)}
				</div>
			)}

			{!!suffix && <div className={classes.suffix}>{suffix}</div>}
		</div>
	)
})

CInputTag.displayName = 'CInputTag'

export default memo(CInputTag) as React.FC<CInputProps>
