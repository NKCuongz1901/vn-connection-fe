'use client'

import { memo, useState } from 'react'

import ModalNotiChatRoom from '@/Components/ChatRoom/ModalNotiChatRoom'
import AdminDeleteMessageModal, {
	AdminDeleteMessageReasonModal,
} from '@/Components/Modal/AdminDeleteMessageModal'
import ChatRoomChatBox from '@/Components/ChatRoomChatBox'
import useChatRoomInboxChat from '@/hooks/ChatRoomInbox/useChatRoomInboxChat'
import BookIcon from '@/svg/BookIcon'

import classes from './DetailTalkroomChatPanel.module.scss'

type DetailTalkroomChatPanelProps = {
	convId: string
}

/** In-room talk room chat panel reusing the shared chat stack. */
function DetailTalkroomChatPanel({ convId }: DetailTalkroomChatPanelProps) {
	const [rulesOpen, setRulesOpen] = useState(false)
	const {
		_scrollRef,
		messList,
		loading,
		editingMessage,
		onSendMessage,
		onEditMessage,
		onCancelEdit,
		onActionMessage,
		onLoadMore,
		onAddReact,
		onEnsureMessageLoaded,
		loadingEnsureMessage,
		adminDeleteTarget,
		openAdminDeleteReason,
		reportContents,
		loadingReportContents,
		onCloseAdminDelete,
		onCloseAdminDeleteReason,
		onAdminDeleteConfirm,
		onAdminDeleteReasonConfirm,
	} = useChatRoomInboxChat({ convId })

	return (
		<div className={classes.wrapper}>
			<div className={classes.header}>
				<h3 className={classes.title}>Chat</h3>
				<button
					type="button"
					className={classes.rulesBtn}
					aria-label="Chat rules"
					onClick={() => setRulesOpen(true)}
				>
					<BookIcon />
				</button>
			</div>

			<div className={classes.chatBox}>
				<ChatRoomChatBox
					convId={convId}
					itemList={messList}
					loading={loading}
					onLoadMore={onLoadMore}
					_scrollRef={_scrollRef}
					onSendMessage={onSendMessage}
					editingMessage={editingMessage}
					onEditMessage={onEditMessage}
					onCancelEdit={onCancelEdit}
					onActionMessage={onActionMessage}
					onAddReact={onAddReact}
					onEnsureMessageLoaded={onEnsureMessageLoaded}
					loadingEnsureMessage={loadingEnsureMessage}
				/>
			</div>

			{rulesOpen ? (
				<ModalNotiChatRoom
					open
					conversation_id={convId}
					onClose={() => setRulesOpen(false)}
					onSubmit={() => setRulesOpen(false)}
				/>
			) : null}

			<AdminDeleteMessageModal
				open={!!adminDeleteTarget && !openAdminDeleteReason}
				senderName={adminDeleteTarget?.user?.name || ''}
				onClose={onCloseAdminDelete}
				onConfirm={onAdminDeleteConfirm}
			/>

			<AdminDeleteMessageReasonModal
				open={openAdminDeleteReason}
				options={reportContents}
				loading={loadingReportContents}
				onClose={onCloseAdminDeleteReason}
				onConfirm={onAdminDeleteReasonConfirm}
			/>
		</div>
	)
}

export default memo(DetailTalkroomChatPanel)
