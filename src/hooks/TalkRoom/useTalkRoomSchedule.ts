import { useCallback, useEffect, useMemo, useState } from 'react'

import {
	BookingSlotsData,
	getBookingSlots,
	parseBookingSlotsMap,
} from '@/apis/talkRoomApis'
import { useModal } from '@/context/ModalContext'
import {
	buildScheduleAtIso,
	buildScheduleDayOptions,
	type ScheduleDayOption,
} from '@/ultis/talkRoomSchedule'

import type { ScheduleDayState } from '@/Components/TalkRoom/ScheduleThisRoom'

export default function useTalkRoomSchedule() {
	const { openError } = useModal()
	const [scheduleEnabled, setScheduleEnabled] = useState(false)
	const [loadingSlots, setLoadingSlots] = useState(false)
	const [bookingSlotsByDay, setBookingSlotsByDay] = useState<
		Record<string, BookingSlotsData>
	>({})
	const [scheduleByDay, setScheduleByDay] = useState<
		Record<string, ScheduleDayState>
	>({})

	const dayOptions = useMemo(() => buildScheduleDayOptions(), [])

	const fetchAllSlots = useCallback(async () => {
		setLoadingSlots(true)
		try {
			const res = await getBookingSlots()
			const dateKeys = dayOptions.map((day) => day.key)

			setBookingSlotsByDay(parseBookingSlotsMap(res, dateKeys))
		} catch (error) {
			openError(error)
		} finally {
			setLoadingSlots(false)
		}
	}, [dayOptions, openError])

	useEffect(() => {
		fetchAllSlots()
	}, [fetchAllSlots])

	const onToggleScheduleEnabled = useCallback((enabled: boolean) => {
		setScheduleEnabled(enabled)
		if (!enabled) {
			setScheduleByDay({})
		}
	}, [])

	const onToggleDay = useCallback(
		(key: string) => {
			const slots = bookingSlotsByDay[key]
			if (slots?.isFull) return

			setScheduleByDay((prev) => {
				const current = prev[key]
				const isCurrentlyChecked = current?.checked ?? false

				if (isCurrentlyChecked) {
					const next = { ...prev }
					delete next[key]
					return next
				}

				return {
					...prev,
					[key]: {
						checked: true,
						fromTime: current?.fromTime ?? null,
					},
				}
			})
		},
		[bookingSlotsByDay],
	)

	const onChangeFromTime = useCallback((key: string, fromTime: string) => {
		setScheduleByDay((prev) => ({
			...prev,
			[key]: {
				checked: true,
				fromTime,
			},
		}))
	}, [])

	const buildSchedules = useCallback(
		(options: ScheduleDayOption[]) => {
			if (!scheduleEnabled) return []

			return options
				.filter((day) => {
					const state = scheduleByDay[day.key]
					const slots = bookingSlotsByDay[day.key]
					return state?.checked && !!state.fromTime && !slots?.isFull
				})
				.map((day) => ({
					schedule_at: buildScheduleAtIso(
						day.date,
						scheduleByDay[day.key]!.fromTime!,
					),
					enabled: true,
				}))
		},
		[bookingSlotsByDay, scheduleByDay, scheduleEnabled],
	)

	const resetSchedule = useCallback(() => {
		setScheduleEnabled(true)
		setScheduleByDay({})
	}, [])

	return {
		scheduleEnabled,
		loadingSlots,
		bookingSlotsByDay,
		scheduleByDay,
		dayOptions,
		onToggleScheduleEnabled,
		onToggleDay,
		onChangeFromTime,
		buildSchedules,
		resetSchedule,
		refetchSlots: fetchAllSlots,
	}
}
