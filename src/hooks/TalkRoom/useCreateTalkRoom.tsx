import { useCallback, useMemo, useState } from 'react'

import { useModal } from '@/context/ModalContext'

import { isArray } from '@/ultis/array'

import { levelOptions } from '@/Variable/common.variable'

import useTalkRoom from './useTalkRoom'
import useTalkRoomSchedule from './useTalkRoomSchedule'

type CreateTalkRoomForm = {
	name: string
	language_id: string
	categorySlugs: string[]
	level: string[]
}

type CreateTalkRoomErrors = Partial<
	Record<'name' | 'language_id' | 'level' | 'categorySlugs', string>
>

const MAX_CATEGORIES = 3
const MAX_LEVELS = 2

const hasIncompatibleLevels = (levels: string[]) =>
	levels.includes('BEGINNER') && levels.includes('ADVANCED')

const LEVEL_INCOMPATIBLE_MSG =
	'Beginner and Advanced cannot be selected at the same time'

const initialForm: CreateTalkRoomForm = {
	name: '',
	language_id: '',
	categorySlugs: [],
	level: [],
}

export default function useCreateTalkRoom({
	onSuccess,
	onClose,
}: {
	onSuccess?: () => void
	onClose?: () => void
} = {}) {
	const {
		languages,
		categories,
		loadingLanguages,
		loadingCategories,
		onCreateTalkRoom,
		loadingCreate,
	} = useTalkRoom()

	const {
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
	} = useTalkRoomSchedule()

	const { openError } = useModal()
	const [form, setForm] = useState<CreateTalkRoomForm>(initialForm)
	const [errors, setErrors] = useState<CreateTalkRoomErrors>({})

	const languageOptions = useMemo(
		() =>
			languages.map((item) => ({
				label: item.name,
				value: item.id,
			})),
		[languages],
	)

	const categoryOptions = useMemo(
		() =>
			categories.map((item) => ({
				label: item.name,
				value: item.slug,
			})),
		[categories],
	)

	const isFormValid = useMemo(() => {
		return (
			!!form.name.trim() &&
			!!form.language_id &&
			form.level.length >= 1 &&
			form.level.length <= MAX_LEVELS &&
			!hasIncompatibleLevels(form.level) &&
			form.categorySlugs.length <= MAX_CATEGORIES
		)
	}, [form])

	const resetForm = useCallback(() => {
		setForm(initialForm)
		setErrors({})
		resetSchedule()
	}, [resetSchedule])

	const onChangeName = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		setForm((prev) => ({ ...prev, name: value }))
		setErrors((prev) => ({ ...prev, name: undefined }))
	}, [])

	const onChangeLanguage = useCallback((value: string) => {
		setForm((prev) => ({ ...prev, language_id: value }))
		setErrors((prev) => ({ ...prev, language_id: undefined }))
	}, [])

	const onChangeCategories = useCallback((values: string[]) => {
		setForm((prev) => ({ ...prev, categorySlugs: values }))
		setErrors((prev) => ({ ...prev, categorySlugs: undefined }))
	}, [])

	const onCategoryMaxExceeded = useCallback(() => {
		openError('You can only select up to 3 categories')
	}, [openError])

	const onChangeLevel = useCallback((values: string[]) => {
		setForm((prev) => ({ ...prev, level: values }))

		if (hasIncompatibleLevels(values)) {
			setErrors((prev) => ({ ...prev, level: LEVEL_INCOMPATIBLE_MSG }))
			return
		}

		setErrors((prev) => ({ ...prev, level: undefined }))
	}, [])

	const validate = useCallback(() => {
		const nextErrors: CreateTalkRoomErrors = {}

		if (!form.name.trim()) {
			nextErrors.name = 'Topic name is required'
		}
		if (!form.language_id) {
			nextErrors.language_id = 'Language is required'
		}
		if (!isArray(form.level, 1)) {
			nextErrors.level = 'Level is required'
		} else if (form.level.length > MAX_LEVELS) {
			nextErrors.level = `You can only select up to ${MAX_LEVELS} levels`
		} else if (hasIncompatibleLevels(form.level)) {
			nextErrors.level = LEVEL_INCOMPATIBLE_MSG
		}
		if (form.categorySlugs.length > MAX_CATEGORIES) {
			nextErrors.categorySlugs = `You can only select up to ${MAX_CATEGORIES} categories`
		}

		setErrors(nextErrors)
		return Object.keys(nextErrors).length === 0
	}, [form])

	const handleSubmit = useCallback(async () => {
		if (!validate()) return

		const schedules = buildSchedules(dayOptions)

		const room = await onCreateTalkRoom({
			name: form.name.trim(),
			language_id: form.language_id,
			categorySlugs: form.categorySlugs,
			level: form.level.map((item) => item.toLowerCase()),
			...(isArray(schedules, 1) ? { schedules } : {}),
		})

		if (room) {
			resetForm()
			onSuccess?.()
			onClose?.()
		}
	}, [
		buildSchedules,
		dayOptions,
		form,
		onClose,
		onCreateTalkRoom,
		onSuccess,
		resetForm,
		validate,
	])

	const handleClose = useCallback(() => {
		resetForm()
		onClose?.()
	}, [onClose, resetForm])

	return {
		form,
		errors,
		languageOptions,
		categoryOptions,
		levelOptions,
		isFormValid,
		loadingCreate,
		loadingLanguages,
		loadingCategories,
		scheduleEnabled,
		loadingSlots,
		bookingSlotsByDay,
		scheduleByDay,
		dayOptions,
		onChangeName,
		onChangeLanguage,
		onChangeCategories,
		onCategoryMaxExceeded,
		onChangeLevel,
		onToggleScheduleEnabled,
		onToggleDay,
		onChangeFromTime,
		handleSubmit,
		handleClose,
	}
}
