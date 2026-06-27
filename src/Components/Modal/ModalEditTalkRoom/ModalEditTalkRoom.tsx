'use client'

import { IconX } from '@tabler/icons-react'
import { Skeleton, Spin } from 'antd'
import clsx from 'clsx'
import { memo, useState } from 'react'

import { TalkRoomDetail, TalkRoomListItem } from '@/apis/talkRoomApis'
import useEditTalkRoom from '@/hooks/TalkRoom/useEditTalkRoom'

import CCheckboxSelect from '@/Components/Custom/CCheckboxSelect'
import CInput from '@/Components/Custom/CInput'
import CModal from '@/Components/Custom/CModal/CModal'
import CRadioSelect from '@/Components/Custom/CRadioSelect'
import ModalNotiChatRoom from '@/Components/ChatRoom/ModalNotiChatRoom'
import ScheduleThisRoom from '@/Components/TalkRoom/ScheduleThisRoom'
import TalkRoomRuleUsage from '@/Components/TalkRoom/TalkRoomRuleUsage'

import classes from './ModalEditTalkRoom.module.scss'

export interface ModalEditTalkRoomProps {
	open: boolean
	roomId: string
	onGetDetailTalkRoom: (
		id: string,
		params?: { [key: string]: any },
	) => Promise<TalkRoomDetail | null>
	onUpdateTalkRoom: (
		id: string,
		input: { name: string },
	) => Promise<TalkRoomListItem | null>
	loadingUpdate?: boolean
	onClose: () => void
	onSuccess?: () => void
}

function ModalEditTalkRoom({
	open,
	roomId,
	onGetDetailTalkRoom,
	onUpdateTalkRoom,
	loadingUpdate = false,
	onClose,
	onSuccess,
}: ModalEditTalkRoomProps) {
	const {
		form,
		errors,
		languageOptions,
		categoryOptions,
		levelOptions,
		isFormValid,
		loadingUpdate: submitting,
		loadingDetail,
		scheduleEnabled,
		scheduleByDay,
		dayOptions,
		loadingSlots,
		bookingSlotsByDay,
		onChangeName,
		onChangeCategories,
		onChangeLanguage,
		onChangeLevel,
		onToggleScheduleEnabled,
		onToggleDay,
		onChangeFromTime,
		handleSubmit,
		handleClose,
	} = useEditTalkRoom({
		roomId,
		onGetDetailTalkRoom,
		onUpdateTalkRoom,
		loadingUpdate,
		onClose,
		onSuccess,
	})

	const [ruleModalOpen, setRuleModalOpen] = useState(false)

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
					<h2 className={classes.title}>Edit room</h2>
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
					<p className={classes.description}>
						Only name can be edited. For other changes, please delete and
						recreate the room.
					</p>
					<p className={classes.hint}>Every talk room lasts 20 minutes</p>

					{loadingDetail ? (
						<div className={classes.form}>
							{Array.from({ length: 4 }).map((_, index) => (
								<Skeleton.Input
									key={index}
									active
									block
									style={{ height: 44, borderRadius: 16 }}
								/>
							))}
						</div>
					) : (
						<>
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
									maxSelected={3}
									disabled
								/>

								<CRadioSelect
									label="Language communication"
									placeholder="Select language"
									options={languageOptions}
									value={form.language_id}
									onChange={onChangeLanguage}
									isRequired
									disabled
								/>

								<CCheckboxSelect
									label="Level recommendation"
									placeholder="Select level"
									options={levelOptions}
									value={form.level}
									onChange={onChangeLevel}
									isRequired
									maxSelected={2}
									disabled
								/>
							</div>

							<ScheduleThisRoom
								readOnly
								enabled={scheduleEnabled}
								loading={loadingSlots}
								dayOptions={dayOptions}
								bookingSlotsByDay={bookingSlotsByDay}
								scheduleByDay={scheduleByDay}
								onToggleEnabled={onToggleScheduleEnabled}
								onToggleDay={onToggleDay}
								onChangeFromTime={onChangeFromTime}
							/>

							<TalkRoomRuleUsage onClick={() => setRuleModalOpen(true)} />
						</>
					)}
				</div>

				<div className={classes.footer}>
					<button
						type="button"
						className={classes.cancelBtn}
						disabled={submitting}
						onClick={handleClose}
					>
						Cancel
					</button>
					<button
						type="button"
						className={clsx(classes.saveBtn, {
							[classes.saveBtnDisabled]:
								!isFormValid || submitting || loadingDetail,
						})}
						disabled={!isFormValid || submitting || loadingDetail}
						onClick={handleSubmit}
					>
						{submitting ? (
							<Spin size="small" className={classes.saveSpinner} />
						) : (
							'Save'
						)}
					</button>
				</div>
			</div>

			{ruleModalOpen && (
				<ModalNotiChatRoom
					open
					onClose={() => setRuleModalOpen(false)}
					onSubmit={() => setRuleModalOpen(false)}
				/>
			)}
		</CModal>
	)
}

export default memo(ModalEditTalkRoom)
