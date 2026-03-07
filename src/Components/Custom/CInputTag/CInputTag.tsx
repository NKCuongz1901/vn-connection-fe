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
import { paginationCommon } from '@/Variable/common.variable'

import { CInputProps } from '@/interface/CComponent/CComponent.interface'

import classes from './CInputTag.module.scss'

import './CInputTag.scss'
interface CInputTagProps {
	id: string
	disabled?: boolean
	value?: string
	onChange?: any
	onSendMessage?: any
	suffix?: any
}
const defaultUser = {
	id: 'allg7pQm2aKtx',
	display: 'all',
	avatar: '',
}
const CInputTag = forwardRef((_props: CInputTagProps, ref: any) => {
	const { id, disabled, suffix, onChange, onSendMessage, value } = _props
	const timeoutRef = useRef(null)
	const pagination = useRef<PaginationType>(cloneDeep(paginationCommon))
	const loadMore = useRef(true)
	const inputRef = useRef(null)
	const containerRef = useRef(null)

	const [openMention, setOpenMention] = useState(false)
	const [loading, setLoading] = useState(false)
	const [users, setUsers] = useState([])
	const [keyword, setKeyword] = useState('')

	useImperativeHandle(ref, () => inputRef.current, [])

	const handleGetUser = async () => {
		setLoading(true)
		try {
			const { page, limit } = pagination.current

			const isNew = page === 1
			const beforeId = timeoutRef.current
			if (isNew) {
				setUsers([])
			}
			const res: any = await getMemberInConv({
				id: id,
				name: keyword,
				page,
				limit,
			})
			if (beforeId !== timeoutRef.current) return
			const _rows = res?.results?.objects?.rows
			loadMore.current = isArray(_rows, limit)
			setUsers((prev) => {
				const rows = (_rows || []).map((i) => ({
					id: i.user_id,
					avatar: i?.user?.avatar,
					display: i?.user?.name,
				}))
				const newData = isNew ? rows : [...(prev || []), ...(rows || [])]

				return uniqueArray(newData, 'id')
			})
		} catch (error) {
			console.log('handleGetUser', error)
		} finally {
			setLoading(false)
		}
	}
	const handleLoadMore = async () => {
		if (!loadMore.current || loading) return
		const { limit } = pagination.current
		const currentPage = Math.trunc((users || []).length / limit)
		pagination.current.page = currentPage + 1
		await handleGetUser()
	}
	const handleScroll = (e: any) => {
		handleScrollCallback(e, handleLoadMore)
	}
	// Build mapping đúng chuẩn plain ↔ markup
	const buildMapping = (plain, markup) => {
		const map = [] // map[i_plain] = i_markup
		let iPlain = 0
		let iMarkup = 0

		while (iPlain < plain.length && iMarkup < markup.length) {
			// detect @[display](id)
			if (markup[iMarkup] === '@' && markup[iMarkup + 1] === '[') {
				const closeBracket = markup.indexOf(']', iMarkup + 2)
				const openParen = markup.indexOf('(', closeBracket + 1)
				const closeParen = markup.indexOf(')', openParen + 1)

				if (closeBracket === -1 || openParen === -1 || closeParen === -1) {
					map[iPlain++] = iMarkup++
					continue
				}

				const display = markup.slice(iMarkup + 2, closeBracket) // text hiển thị plain = '@' + display

				// plain: '@display'
				// map '@'
				map[iPlain++] = iMarkup

				// map từng ký tự trong display
				for (let k = 0; k < display.length; k++) {
					map[iPlain++] = iMarkup + 2 + k
				}

				// skip toàn bộ @[display](id)
				iMarkup = closeParen + 1
				continue
			}

			// ký tự thường
			map[iPlain++] = iMarkup++
		}

		// fallback nếu plain dài hơn
		while (iPlain < plain.length) {
			map[iPlain++] = iMarkup
		}

		return map
	}

	// Replace mention
	const handleChangeValue = (item) => {
		const el = inputRef.current
		if (!el) return

		const cursorPos = el.selectionStart
		const plain = el.value
		const markup = value // value của MentionsInput

		// 1. Tìm @ gần nhất trước con trỏ
		let atPosPlain = -1
		for (let i = cursorPos - 1; i >= 0; i--) {
			if (plain[i] === '@') {
				atPosPlain = i
				break
			}
			if (plain[i] === ' ' || plain[i] === '\n') break
		}
		if (atPosPlain === -1) return

		// 2. Build mapping đúng chuẩn
		const map = buildMapping(plain, markup)

		// 3. Lấy vị trí tương ứng trong markup
		const atPosMarkup = map[atPosPlain]
		const cursorMarkup = map[cursorPos] ?? markup.length

		// 4. Replace đúng markup
		const newMention = `@[${item.display}](${item.id})`

		const newMarkup =
			markup.slice(0, atPosMarkup) + newMention + markup.slice(cursorMarkup)

		// 5. Cập nhật MentionsInput
		onChange({ target: { value: newMarkup } })

		// 6. Focus đúng -- về cuối mention đã insert
		const newCaretPos = atPosPlain + 1 + item.display.length

		requestAnimationFrame(() => {
			el.focus()
			el.setSelectionRange(newCaretPos, newCaretPos)
		})
		setOpenMention(false)
	}

	const handleChangeKeyword = (e) => {
		setOpenMention(true)
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current)
		}
		timeoutRef.current = setTimeout(() => {
			pagination.current.page = 1
			setKeyword(e)
		}, 500)
	}

	const focusToPosition = (pos) => {
		const el = inputRef.current
		if (!el) return
		el.focus()
		el.setSelectionRange(pos, pos)
	}
	const getClickedMentionIndex = (targetNode) => {
		const highlighter = containerRef.current.querySelector(
			'.mentionsInput__highlighter',
		)
		if (!highlighter) return -1

		let pos = 0

		for (const node of highlighter.childNodes) {
			// Nếu node chính là cái mà user click
			if (node === targetNode) {
				return pos // vị trí bắt đầu mention
			}

			// Nếu node là mention khác
			if (node.classList?.contains('mention')) {
				pos += node.textContent.length
				continue
			}

			// Nếu là substring thường
			pos += node.textContent.length
		}

		return -1
	}

	const handleMentionClick = (node) => {
		const startPos = getClickedMentionIndex(node)
		if (startPos === -1) return

		const mentionText = node.textContent
		const caretPos = startPos + mentionText.length

		focusToPosition(caretPos)
	}
	useEffect(() => {
		handleGetUser()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [keyword])

	useEffect(() => {
		const highlighter = containerRef.current?.querySelector(
			'.mentionsInput__highlighter',
		)
		if (!highlighter) return
		const onClick = (e) => {
			if (e.target.classList.contains('mention')) {
				handleMentionClick(e.target)
			}
		}
		highlighter.addEventListener('click', onClick)
		return () => highlighter.removeEventListener('click', onClick)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [value])
	useEffect(() => {
		const el = inputRef.current
		if (!el) return
		const onKeyDown = (e) => {
			if (e.key === 'Enter' && !e.shiftKey) {
				e.preventDefault()
				e.stopPropagation()
				onSendMessage(e)
			}
		}
		el.addEventListener('keydown', onKeyDown)
		return () => {
			el.removeEventListener('keydown', onKeyDown)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [inputRef.current, value])

	const _renderCustomSuggestionsContainer = () => {
		if (!openMention) return
		return (
			<Flex
				vertical
				className={classes.wrapperMentionSuggest}
				onScroll={handleScroll}
			>
				{[defaultUser, ...users].map((i) => {
					const { id, avatar, display } = i || {}
					const isAll = id === defaultUser.id
					return (
						<Flex
							key={id}
							className={classes.mentionSuggestItem}
							onClick={() => handleChangeValue(i)}
						>
							<div className={classes.avatar}>
								{isAll ? <People /> : <CAvatar src={avatar} size={24} />}
							</div>
							{isAll && '@'}
							{display}
						</Flex>
					)
				})}
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
				a11ySuggestionsListLabel={'Suggested mentions'}
				className="mentionsInput"
				customSuggestionsContainer={() => _renderCustomSuggestionsContainer()}
			>
				<Mention
					trigger={'@'}
					className="mention"
					data={(search) => {
						handleChangeKeyword(search)
						return [defaultUser]
					}}
					displayTransform={(_id, display) => `@${display}`}
				/>
			</MentionsInput>
			{!!suffix && <div className={classes.suffix}>{suffix}</div>}
		</div>
	)
})
CInputTag.displayName = 'CInputTag' // 👈 THÊM DÒNG NÀY ĐỂ FIX

export default memo(CInputTag) as React.FC<CInputProps>
