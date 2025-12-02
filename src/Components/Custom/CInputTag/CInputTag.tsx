'use client'

import { forwardRef, memo, useEffect, useRef, useState } from 'react'
import { Mention, MentionsInput } from 'react-mentions'

import { CInputProps } from '@/interface/CComponent/CComponent.interface'

import clsx from 'clsx'
import classes from './CInputTag.module.scss'
import './CInputTag.scss'
import { randomString } from '@/ultis/string.ults'
import { getMemberInConv } from '@/apis/conversationApis'
import CAvatar from '../CAvatar'
interface CInputTagProps {
	a: any
}

const defaultUser = {
	id: 'all',
	display: 'All',
	avatar: '',
}
const CInputTag = forwardRef((_props: any, ref: any) => {
	const { id, onChange, value } = _props
	const divRef = useRef<HTMLDivElement | null>(null)
	const timeoutRef = useRef(null)
	const [openMention, setOpenMention] = useState(false)

	const [users, setUsers] = useState([defaultUser])
	const [keyword, setKeyword] = useState('')
	const handleGetUser = async () => {
		try {
			const res: any = await getMemberInConv({ id: id, name: keyword })
			const a = res?.results?.objects?.rows
			setUsers([
				defaultUser,
				...(a || []).map((i) => ({
					id: i.user_id,
					avatar: i?.user?.avatar,
					display: i?.user?.name,
				})),
			])
		} catch (error) {}
	}

	const handleGetKeyWord = (e) => {
		if (!openMention) return
		if (timeoutRef) {
			clearTimeout(timeoutRef.current)
		}
		timeoutRef.current = setTimeout(() => {
			const listEl = divRef.current.querySelector(
				'.mentionsInput__input',
			) as any
			if (!listEl) return

			const cursorPos = listEl?.selectionStart + 1
			const textBeforeCursor = listEl?.value?.slice(0, cursorPos)

			// Tìm vị trí @ cuối cùng trước con trỏ
			const atIndex = textBeforeCursor.lastIndexOf('@')
			if (atIndex === -1) return // không có @ trước con trỏ

			// Lấy từ @ tới con trỏ
			const keyword = textBeforeCursor.slice(atIndex + 1) // không lấy @
			setKeyword(keyword)
		}, 500)
	}

	useEffect(() => {
		const el = divRef.current
		if (!el) return

		const handleKeyDown = (e) => {
			if (e.key === '@') {
				setOpenMention(true)
			}

			// Phím để đóng mention
			const keysToClose = [
				'ArrowUp',
				'ArrowDown',
				'ArrowLeft',
				'ArrowRight',
				'Enter',
			]
			if (keysToClose.includes(e.key) || (e.key === 'Enter' && e.shiftKey)) {
				setOpenMention(false)
			}
		}

		el.addEventListener('keydown', handleKeyDown)

		return () => el.removeEventListener('keydown', handleKeyDown)
	}, [])

	useEffect(() => {
		if (!openMention) return
		if (!divRef.current) return

		let listEl = null
		let timeoutId = null

		const onScroll = () => {
			if (!listEl) return
			if (listEl.scrollTop + listEl.clientHeight >= listEl.scrollHeight - 5) {
				console.log('objectloadmore')
			}
		}

		timeoutId = setTimeout(() => {
			listEl = divRef.current.querySelector('.mentionsInput__suggestions__list')
			if (listEl) {
				listEl.addEventListener('scroll', onScroll)
			}
		}, 500)

		return () => {
			if (listEl) listEl.removeEventListener('scroll', onScroll)
			clearTimeout(timeoutId)
		}
	}, [openMention])

	useEffect(() => {
		handleGetUser()
	}, [keyword])
	return (
		<div
			ref={divRef}
			className={clsx(classes.layout, 'mentionsInput')}
			onKeyDown={handleGetKeyWord}
		>
			<MentionsInput
				placeholder="Text message"
				value={value}
				onChange={onChange}
				a11ySuggestionsListLabel={'Suggested mentions'}
				className="mentionsInput"
			>
				<Mention
					trigger={openMention ? '@' : randomString()}
					className="mention"
					renderSuggestion={(entry, search, highlightedDisplay) => (
						<div style={{ display: 'flex', alignItems: 'center', padding: 4 }}>
							<CAvatar src={entry.avatar} />
							<span>{highlightedDisplay}</span>
						</div>
					)}
					data={users}
					displayTransform={(_id, display) => `@${display}`}
					onSearchChange={() => {
						// Không làm gì cả, không filter
						return users
					}}
				/>
			</MentionsInput>
		</div>
	)
})
CInputTag.displayName = 'CInputTag' // 👈 THÊM DÒNG NÀY ĐỂ FIX

export default memo(CInputTag) as React.FC<CInputProps>
