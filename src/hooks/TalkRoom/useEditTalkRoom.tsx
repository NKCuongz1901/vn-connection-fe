import dayjs from 'dayjs'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { TalkRoomDetail, TalkRoomListItem, UpdateTalkRoomInput } from '@/apis/talkRoomApis'
import type { ScheduleDayState } from '@/Components/TalkRoom/ScheduleThisRoom'
import { buildScheduleDayOptions } from '@/ultis/talkRoomSchedule'
import { levelOptions } from '@/Variable/common.variable'

import useTalkRoom from './useTalkRoom'
import useTalkRoomSchedule from './useTalkRoomSchedule'

type EditTalkRoomForm = {
	name: string
	language_id: string
	categorySlugs: string[]
	level: string[]
}

type EditTalkRoomErrors = {
	name?: string
}

const emptyForm: EditTalkRoomForm = {
	name: '',
	language_id: '',
	categorySlugs: [],
	level: [],
}

const mapDetailToForm = (detail?: TalkRoomDetail | null): EditTalkRoomForm => {
	if (!detail) return emptyForm

	return {
		name: detail.name || '',
		language_id: detail.language_id || detail.language?.id || '',
		categorySlugs: (detail.categories || [])
			.map((item) => item.slug || item.category_details?.slug)
			.filter(Boolean) as string[],
		level: (detail.level || []).map((item) => item.toUpperCase()),
	}
}

const mapDetailToSchedule = (detail?: TalkRoomDetail | null) => {
	const scheduleByDay: Record<string, ScheduleDayState> = {}
	const schedules =
		detail?.schedules?.filter((item) => item.enabled !== false) ?? []

	for (const schedule of schedules) {
		if (!schedule.schedule_at) continue

		const date = dayjs(schedule.schedule_at)
		if (!date.isValid()) continue

		scheduleByDay[date.format('YYYY-MM-DD')] = {
			checked: true,
			fromTime: date.format('HH:mm'),
		}
	}

	return {
		scheduleEnabled: schedules.length > 0,
		scheduleByDay,
	}
}

export default function useEditTalkRoom({
	roomId,
	onGetDetailTalkRoom,
	onUpdateTalkRoom,
	loadingUpdate = false,
	onSuccess,
	onClose,
}: {
	roomId: string
	onGetDetailTalkRoom: (
		id: string,
		params?: { [key: string]: any },
	) => Promise<TalkRoomDetail | null>
	onUpdateTalkRoom: (
		id: string,
		input: UpdateTalkRoomInput,
	) => Promise<TalkRoomListItem | null>
	loadingUpdate?: boolean
	onSuccess?: () => void
	onClose?: () => void
}) {
	const { categories } = useTalkRoom()
	const {
		loadingSlots,
		bookingSlotsByDay,
		dayOptions: scheduleDayOptions,
	} = useTalkRoomSchedule()

	const [form, setForm] = useState<EditTalkRoomForm>(emptyForm)
	const [savedForm, setSavedForm] = useState<EditTalkRoomForm>(emptyForm)
	const [errors, setErrors] = useState<EditTalkRoomErrors>({})
	const [scheduleEnabled, setScheduleEnabled] = useState(false)
	const [scheduleByDay, setScheduleByDay] = useState<
		Record<string, ScheduleDayState>
	>({})
	const [loadingDetail, setLoadingDetail] = useState(false)
	const [detail, setDetail] = useState<TalkRoomDetail | null>(null)

	const dayOptions = useMemo(() => {
		const base = scheduleDayOptions.length
			? scheduleDayOptions
			: buildScheduleDayOptions()
		const baseKeys = new Set(base.map((day) => day.key))

		const extraDays = Object.entries(scheduleByDay)
			.filter(([, state]) => state.checked)
			.map(([key]) => key)
			.filter((key) => !baseKeys.has(key))
			.map((key) => {
				const date = dayjs(key)
				return {
					key,
					date,
					label: date.format('DD/MM'),
					scheduleAtParam: date.startOf('day').toISOString(),
				}
			})

		return [...base, ...extraDays]
	}, [scheduleByDay, scheduleDayOptions])

	const languageOptions = useMemo(() => {
		if (!form.language_id) return []

		return [
			{
				label: detail?.language?.name || '—',
				value: form.language_id,
			},
		]
	}, [detail?.language?.name, form.language_id])

	const categoryOptions = useMemo(() => {
		const optionMap = new Map(
			categories.map((item) => [
				item.slug,
				{ label: item.name, value: item.slug },
			]),
		)

		for (const slug of form.categorySlugs) {
			if (optionMap.has(slug)) continue

			const fromDetail = (detail?.categories || []).find(
				(item) => (item.slug || item.category_details?.slug) === slug,
			)

			optionMap.set(slug, {
				label: fromDetail?.category_details?.name || slug,
				value: slug,
			})
		}

		return Array.from(optionMap.values())
	}, [categories, detail?.categories, form.categorySlugs])

	useEffect(() => {
		if (!roomId) return

		let cancelled = false

		const loadDetail = async () => {
			setLoadingDetail(true)
			setForm(emptyForm)
			setSavedForm(emptyForm)
			setErrors({})
			setScheduleEnabled(false)
			setScheduleByDay({})
			setDetail(null)

			const roomDetail = await onGetDetailTalkRoom(roomId)
			if (cancelled) return

			if (roomDetail) {
				const nextForm = mapDetailToForm(roomDetail)
				const schedule = mapDetailToSchedule(roomDetail)

				setDetail(roomDetail)
				setForm(nextForm)
				setSavedForm(nextForm)
				setScheduleEnabled(schedule.scheduleEnabled)
				setScheduleByDay(schedule.scheduleByDay)
			}

			setLoadingDetail(false)
		}

		loadDetail()

		return () => {
			cancelled = true
		}
	}, [onGetDetailTalkRoom, roomId])

	const isFormValid = useMemo(
		() =>
			!!form.name.trim() &&
			!!form.language_id &&
			form.level.length >= 1,
		[form],
	)

	const onChangeName = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setForm((prev) => ({ ...prev, name: e.target.value }))
		setErrors((prev) => ({ ...prev, name: undefined }))
	}, [])

	const onChangeCategories = useCallback(() => undefined, [])

	const validate = useCallback(() => {
		if (!form.name.trim()) {
			setErrors({ name: 'Topic name is required' })
			return false
		}
		if (!form.language_id || !form.level.length) {
			return false
		}
		return true
	}, [form.language_id, form.level.length, form.name])

	const handleSubmit = useCallback(async () => {
		if (!validate() || !roomId) return

		const room = await onUpdateTalkRoom(roomId, {
			name: form.name.trim(),
			language_id: form.language_id,
			categorySlugs: form.categorySlugs,
			level: form.level,
		})

		if (room) {
			onSuccess?.()
			onClose?.()
		}
	}, [form, onClose, onSuccess, onUpdateTalkRoom, roomId, validate])

	const handleClose = useCallback(() => {
		setForm(savedForm)
		setErrors({})
		onClose?.()
	}, [onClose, savedForm])

	const noop = useCallback(() => undefined, [])

	return {
		form,
		errors,
		languageOptions,
		categoryOptions,
		levelOptions,
		isFormValid,
		loadingUpdate,
		loadingDetail,
		scheduleEnabled,
		scheduleByDay,
		dayOptions,
		loadingSlots,
		bookingSlotsByDay,
		onChangeName,
		onChangeCategories,
		onChangeLanguage: noop,
		onChangeLevel: noop,
		onToggleScheduleEnabled: noop,
		onToggleDay: noop,
		onChangeFromTime: noop,
		handleSubmit,
		handleClose,
	}
}
