'use client'

import { Flex } from 'antd'
import { IconChevronLeft } from '@tabler/icons-react'

import DetailTalkroomSpeakerStage from '@/Components/TalkRoom/DetailTalkroom/DetailTalkroomSpeakerStage'
import useDetailTalkroom from '@/hooks/TalkRoom/useDetailTalkroom'
import { mainRoutes } from '@/routes/MainRoutes'
import { useLocalePath } from '@/ultis/route'
import MicOffIcon from '@/svg/Talkroom/MicOffIcon'
import ShareIcon from '@/svg/FriendSvg/ShareIcon'

import classes from './DetailTalkroom.module.scss'
import { formatTalkRoomLevelLabel } from '@/ultis/talkRoom'

function DetailTalkroom({ id }: { id: string }) {
	const { talkRoomDetail, loadingTalkRoomDetail } = useDetailTalkroom(id)
	const { onChangeRoute } = useLocalePath()

	const _renderHostContent = () => {
		return (
			<div className={classes.hostContent}>
				<div className={classes.talkroomInfoContainer}>
					<div className={classes.talkroomInfo}>
						<div className={classes.talkroomMetaData}>
							<div className={classes.textNormal}>
								{talkRoomDetail?.language?.name} |{' '}
								{(talkRoomDetail?.level || [])
									.map(formatTalkRoomLevelLabel)
									.join(', ')}
							</div>
						</div>
						<div className={classes.talkroomTitle}>{talkRoomDetail?.name}</div>
					</div>
					<div className={classes.ctaButtons}>
						<div className={classes.ctaButtonWrapper}>
							<MicOffIcon />
						</div>
						<div className={classes.ctaButtonWrapper}>
							<ShareIcon />
						</div>
					</div>
				</div>
				<DetailTalkroomSpeakerStage
					maxSpeakers={talkRoomDetail?.max_speakers ?? 2}
				/>
			</div>
		)
	}

	const _renderListenerContent = () => {
		return <div className={classes.listenerContent}></div>
	}

	const _renderTimerContent = () => {
		return <div className={classes.timerContent}></div>
	}

	const _renderChatContent = () => {
		return <div className={classes.chatContent}></div>
	}
	return (
		<div className={classes.wrapper}>
			<Flex className={classes.header}>
				<IconChevronLeft
					className={classes.iconBack}
					onClick={() => onChangeRoute(mainRoutes.talkroom)}
				/>
				<div className={classes.title}>Live room</div>
			</Flex>
			<Flex className={classes.content}>
				<div className={classes.leftContent}>
					{_renderHostContent()}
					{_renderListenerContent()}
				</div>
				<div className={classes.rightContent}>
					{_renderTimerContent()}
					{_renderChatContent()}
				</div>
			</Flex>
		</div>
	)
}

export default DetailTalkroom
