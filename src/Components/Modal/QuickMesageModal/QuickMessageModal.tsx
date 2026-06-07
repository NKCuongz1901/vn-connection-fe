import { IconChevronLeft, IconPlus } from '@tabler/icons-react'
import { memo, useCallback, useRef, useState } from 'react'

import useQuickMessage, {
	QuickMessageItem,
} from '@/hooks/QuickMesage/useQuickMessage'

import SettingIcon from '@/svg/SettingIcon'
import { IconSettingsFilled } from '@tabler/icons-react'

import CModal from '@/Components/Custom/CModal/CModal'

import QuickMessageFormView, {
	QuickMessageFormRef,
} from './QuickMessageFormView'
import QuickMessageListContent from './QuickMessageListView'
import classes from './QuickMessageModal.module.scss'

type QuickMessageView = 'list' | 'manage' | 'create' | 'edit'

interface QuickMessageModalProps {
	open: boolean
	onClose: () => void
	onSelect?: (item: QuickMessageItem) => void
}

function QuickMessageModal(props: QuickMessageModalProps) {
	const { open, onClose, onSelect } = props
	const [view, setView] = useState<QuickMessageView>('list')
	const [previousView, setPreviousView] = useState<QuickMessageView>('list')
	const [editingItem, setEditingItem] = useState<QuickMessageItem | null>(null)
	const [canSubmitForm, setCanSubmitForm] = useState(false)
	const formRef = useRef<QuickMessageFormRef>(null)

	const { list, loading, onScroll, onCreate, onUpdate, onDelete } =
		useQuickMessage()

	const handleClose = useCallback(() => {
		setView('list')
		setEditingItem(null)
		setCanSubmitForm(false)
		onClose()
	}, [onClose])

	const handleBack = useCallback(() => {
		setView((prev) => {
			if (prev === 'edit') return 'manage'
			if (prev === 'create') return previousView
			if (prev === 'manage') return 'list'
			return 'list'
		})
		setEditingItem(null)
		setCanSubmitForm(false)
	}, [previousView])

	const goToCreate = useCallback(() => {
		setPreviousView(view === 'manage' ? 'manage' : 'list')
		setEditingItem(null)
		setView('create')
		setCanSubmitForm(false)
	}, [view])

	const goToEdit = useCallback((item: QuickMessageItem) => {
		setPreviousView('manage')
		setEditingItem(item)
		setView('edit')
		setCanSubmitForm(false)
	}, [])

	const handleCreateSuccess = useCallback(async () => {
		setView('list')
		setEditingItem(null)
		setCanSubmitForm(false)
	}, [])

	const handleUpdateSuccess = useCallback(async () => {
		setView('manage')
		setEditingItem(null)
		setCanSubmitForm(false)
	}, [])

	const handleDeleteSuccess = useCallback(async () => {
		setView('manage')
		setEditingItem(null)
		setCanSubmitForm(false)
	}, [])

	const handleSelect = useCallback(
		(item: QuickMessageItem) => {
			onSelect?.(item)
			handleClose()
		},
		[handleClose, onSelect],
	)

	const renderTitle = () => {
		if (view === 'create') {
			return (
				<div className={classes.modalTitle}>
					<span className={classes.backBtn} onClick={handleBack}>
						<IconChevronLeft size={16} />
					</span>
					Add quick message
				</div>
			)
		}
		if (view === 'edit') {
			return (
				<div className={classes.modalTitle}>
					<span className={classes.backBtn} onClick={handleBack}>
						<IconChevronLeft size={16} />
					</span>
					Edit quick message
				</div>
			)
		}
		if (view === 'manage') {
			return (
				<div className={classes.modalTitle}>
					<span className={classes.backBtn} onClick={handleBack}>
						<IconChevronLeft size={16} />
					</span>
					Manage quick message
				</div>
			)
		}
		return 'Quick message'
	}

	const renderFooter = () => {
		if (view === 'list' && list.length === 0 && !loading) {
			return null
		}

		if (view === 'list') {
			return (
				<div className={classes.footer}>
					<button
						type="button"
						className={`${classes.footerBtn} ${classes.footerBtnSecondary}`}
						onClick={() => setView('manage')}
					>
						<IconSettingsFilled size={24} color="#0F1729" />
						Manage quick message
					</button>
					<button
						type="button"
						className={`${classes.footerBtn} ${classes.footerBtnPrimary}`}
						onClick={goToCreate}
					>
						<IconPlus size={24} color="#FFFFFF" />
						Add quick message
					</button>
				</div>
			)
		}

		if (view === 'manage') {
			return (
				<div className={classes.footer}>
					<button
						type="button"
						className={`${classes.footerBtn} ${classes.footerBtnPrimary}`}
						onClick={goToCreate}
					>
						<IconPlus size={24} color="#FFFFFF" />
						Add quick message
					</button>
				</div>
			)
		}

		if (view === 'create') {
			return (
				<div className={classes.footer}>
					<button
						type="button"
						disabled={!canSubmitForm}
						className={`${classes.footerBtn} ${
							canSubmitForm
								? classes.footerBtnPrimary
								: classes.footerBtnDisabled
						}`}
						onClick={() => formRef.current?.submit()}
					>
						Add
					</button>
				</div>
			)
		}

		if (view === 'edit') {
			return (
				<div className={classes.footer}>
					<button
						type="button"
						disabled={!canSubmitForm}
						className={`${classes.footerBtn} ${
							canSubmitForm
								? classes.footerBtnOrange
								: classes.footerBtnDisabled
						}`}
						onClick={() => formRef.current?.submit()}
					>
						Save
					</button>
				</div>
			)
		}

		return null
	}

	if (!open) return null

	return (
		<CModal
			onClose={handleClose}
			onCancel={handleClose}
			title={renderTitle()}
			styles={{
				content: {
					width: 660,
					maxHeight: '85vh',
				},
				body: {
					padding: 0,
				},
			}}
			footer={[renderFooter()]}
		>
			<div className={classes.body}>
				{(view === 'list' || view === 'manage') && (
					<QuickMessageListContent
						list={list}
						loading={loading}
						mode={view === 'manage' ? 'manage' : 'pick'}
						showGuide={view === 'list'}
						onScroll={onScroll}
						onSelect={view === 'list' ? handleSelect : undefined}
						onEdit={goToEdit}
						onCreate={goToCreate}
					/>
				)}

				{view === 'create' && (
					<QuickMessageFormView
						ref={formRef}
						onValidChange={setCanSubmitForm}
						onSubmit={async (payload) => {
							const result = await onCreate(payload)
							if (result) await handleCreateSuccess()
							return result
						}}
					/>
				)}

				{view === 'edit' && (
					<QuickMessageFormView
						ref={formRef}
						isEdit
						data={editingItem}
						onValidChange={setCanSubmitForm}
						onSubmit={async (payload) => {
							if (!editingItem?.id) return
							const result = await onUpdate(editingItem.id, payload)
							if (result) await handleUpdateSuccess()
							return result
						}}
						onDelete={async (id) => {
							const result = await onDelete(id)
							if (result) await handleDeleteSuccess()
							return result
						}}
					/>
				)}
			</div>
		</CModal>
	)
}

export default memo(QuickMessageModal)
