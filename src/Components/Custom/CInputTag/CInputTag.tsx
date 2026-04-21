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

import { getMemberInConv } from '@/apis/conversationApis'

import { arrayFrom, isArray, uniqueArray } from '@/ultis/array'
import { handleScrollCallback } from '@/ultis/common'

import People from '@/svg/People'
import CAvatar from '../CAvatar'

import { PaginationType } from '@/interface/common/common.interface'
import { optionFriends, paginationCommon } from '@/Variable/common.variable'

import { CInputProps } from '@/interface/CComponent/CComponent.interface'

import classes from './CInputTag.module.scss'
import './CInputTag.scss'
import { getFriends } from '@/apis/friendApis'

interface CInputTagProps {
	id?: string
	disabled?: boolean
	value?: string
	onChange?: any
	onSendMessage?: any
	suffix?: any
	source?: 'conversation' | 'comment'
}

const defaultUser = {
	id: 'allg7pQm2aKtx',
	display: 'all',
	avatar: '',
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
	} = _props

	const debounceRef = useRef<any>(null)
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
		if (e.key !== 'Enter') return

		if (e.shiftKey) return

		const inputValue = e.target?.value || ''
		const pendingMention = hasPendingMention(inputValue, value || '')
		const suggestionOpen = isMentionSuggestionOpen()

		if (suggestionOpen || (openMention && pendingMention)) {
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
				onChange={onChange}
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

			{!!suffix && <div className={classes.suffix}>{suffix}</div>}
		</div>
	)
})

CInputTag.displayName = 'CInputTag'

export default memo(CInputTag) as React.FC<CInputProps>
