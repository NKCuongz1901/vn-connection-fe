'use client'

import { IconX } from '@tabler/icons-react'
import { memo } from 'react'

import useCreateTalkRoom from '@/hooks/TalkRoom/useCreateTalkRoom'

import CButton from '@/Components/Custom/CButton'
import CCheckboxSelect from '@/Components/Custom/CCheckboxSelect'
import CInput from '@/Components/Custom/CInput'
import CModal from '@/Components/Custom/CModal/CModal'
import CRadioSelect from '@/Components/Custom/CRadioSelect'
import ScheduleThisRoom from '@/Components/TalkRoom/ScheduleThisRoom'

import classes from './ModalCreateTalkRoom.module.scss'

export interface ModalCreateTalkRoomProps {
	open: boolean
	onClose: () => void
	onSuccess?: () => void
}

function ModalCreateTalkRoom({
	open,
	onClose,
	onSuccess,
}: ModalCreateTalkRoomProps) {
	const {
		form,
		errors,
		languageOptions,
		categoryOptions,
		levelOptions,
		isFormValid,
		loadingCreate,
		loadingLanguages,
		loadingCategories,
		onChangeName,
		onChangeLanguage,
		onChangeCategories,
		onChangeLevel,
		onToggleScheduleEnabled,
		onToggleDay,
		onChangeFromTime,
		scheduleEnabled,
		loadingSlots,
		bookingSlotsByDay,
		scheduleByDay,
		dayOptions,
		handleSubmit,
		handleClose,
	} = useCreateTalkRoom({ onClose, onSuccess })

	if (!open) return null

	return (
		<CModal
			open
			centered
			closable={false}
			footer={null}
			onCancel={handleClose}
			styles={{
				content: {
					width: 660,
					maxWidth: 'calc(100vw - 32px)',
					maxHeight: '90vh',
					padding: 0,
					borderRadius: 8,
					overflow: 'hidden',
					display: 'flex',
					flexDirection: 'column',
				},
				body: {
					padding: 0,
					flex: 1,
					minHeight: 0,
					overflow: 'hidden',
					display: 'flex',
					flexDirection: 'column',
				},
			}}
		>
			<div className={classes.wrapper}>
				<div className={classes.header}>
					<h2 className={classes.title}>Create a talk room</h2>
					<button
						type="button"
						className={classes.closeBtn}
						aria-label="Close"
						onClick={handleClose}
					>
						<IconX size={16} />
					</button>
				</div>

				<div className={classes.body}>
					<p className={classes.hint}>Every talk room lasts 20 minutes</p>

					<div className={classes.form}>
						<CInput
							label="Topic name"
							placeholder="Enter topic name"
							value={form.name}
							error={errors.name}
							isRequired
							maxLength={255}
							onChange={onChangeName}
						/>

						<CCheckboxSelect
							label="Category"
							placeholder="Select category"
							options={categoryOptions}
							value={form.categorySlugs}
							onChange={onChangeCategories}
							error={errors.categorySlugs}
							maxSelected={3}
							disabled={loadingCategories}
						/>

						<CRadioSelect
							label="Language communication"
							placeholder="Select language"
							options={languageOptions}
							value={form.language_id}
							onChange={onChangeLanguage}
							error={errors.language_id}
							isRequired
							disabled={loadingLanguages}
						/>

						<CCheckboxSelect
							label="Level recommendation"
							placeholder="Select level"
							options={levelOptions}
							value={form.level}
							onChange={onChangeLevel}
							error={errors.level}
							isRequired
							maxSelected={2}
						/>
					</div>

					<ScheduleThisRoom
						enabled={scheduleEnabled}
						loading={loadingSlots}
						dayOptions={dayOptions}
						bookingSlotsByDay={bookingSlotsByDay}
						scheduleByDay={scheduleByDay}
						onToggleEnabled={onToggleScheduleEnabled}
						onToggleDay={onToggleDay}
						onChangeFromTime={onChangeFromTime}
					/>
				</div>

				<div className={classes.footer}>
					<CButton
						ctype={isFormValid ? 'oranger' : 'disabled'}
						className={classes.createBtn}
						disabled={!isFormValid || loadingCreate}
						loading={loadingCreate}
						onClick={handleSubmit}
					>
						Create
					</CButton>
				</div>
			</div>
		</CModal>
	)
}

export default memo(ModalCreateTalkRoom)
