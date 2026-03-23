import { IconPlayerPauseFilled } from '@tabler/icons-react'
import { useWavesurfer } from '@wavesurfer/react'
import { Flex } from 'antd'
import clsx from 'clsx'
import { memo, useRef } from 'react'

import { getUserInfo } from '@/ultis/storage'

import PlayIcon from '@/svg/PlayIcon'

import classes from './VisualizerWithPlay.module.scss'

const VisualizerWithPlay = ({ src, item }: { src: string; item?: any }) => {
	const containerRef = useRef(null)

	// SỬ DỤNG HOOK CUNG CẤP TỪ @wavesurfer/react
	const { wavesurfer, isPlaying, currentTime } = useWavesurfer({
		container: containerRef,
		height: 40,
		waveColor: '#48546B',
		progressColor: '#006B35',
		url: src,
		// Thêm tùy chọn để Wavesurfer xử lý toàn bộ chiều rộng container
		barWidth: 2,
		cursorWidth: 0,
	})

	const isMe = getUserInfo('id') === item?.user_id // Đảm bảo sử dụng item an toàn

	const handleTogglePlayPause = () => {
		if (wavesurfer) {
			wavesurfer.playPause()
		}
	}

	// Định dạng thời gian (ví dụ: 0:00)
	const formatTime = (seconds) => {
		const minutes = Math.floor(seconds / 60)
		const secs = Math.floor(seconds % 60)
		return `${minutes}:${secs < 10 ? '0' : ''}${secs}`
	}

	return (
		<div className={classes.wrapper}>
			<Flex className={clsx(classes.container, { [classes.right]: isMe })}>
				<div ref={containerRef} className={classes.audio} />
				<Flex
					className={clsx(classes.playAudioContainer, {
						[classes.isMe]: isMe,
					})}
					align="center"
					onClick={handleTogglePlayPause}
				>
					<Flex className={classes.playAudio}>
						{isPlaying ? (
							<IconPlayerPauseFilled color="#006B35" />
						) : (
							<PlayIcon />
						)}
					</Flex>
				</Flex>
				<span style={{ minWidth: '40px', fontSize: '0.8em' }}>
					{formatTime(currentTime)}
				</span>
			</Flex>
		</div>
	)
}

export default memo(VisualizerWithPlay)
