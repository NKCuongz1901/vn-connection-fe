import { Flex } from 'antd'
import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'
import { AudioVisualizer } from 'react-audio-visualize'

import { handleCreateAudio, playAudio, stopAudio } from '@/ultis/file.utls'
import { getUserInfo } from '@/ultis/storage.ults'

import PlayIcon from '@/svg/PlayIcon'

import classes from './VisualizerWithPlay.module.scss'
const VisualizerWithPlay = ({ src, item }) => {
	const { id, user_id } = item || {}
	const [blob, setBlob] = useState<Blob | null>(null)
	const audioRef = useRef<HTMLAudioElement>(null)
	const visualizerRef = useRef<HTMLCanvasElement>(null)
	const [isPlay, setIsPlay] = useState(false)

	const isMe = getUserInfo('id') === user_id

	useEffect(() => {
		const fetchAudio = async () => {
			const res = await handleCreateAudio(src)

			const audioBlob = new Blob([res], { type: 'audio/mpeg' })

			setBlob(audioBlob)
		}
		fetchAudio()
	}, [src])

	const handlePlay = () => {
		setIsPlay(true)
		playAudio(id, src, () => setIsPlay(false))
	}
	const handlePause = () => {
		stopAudio(id)
		setIsPlay(false)
	}

	return (
		<div>
			{blob && (
				<>
					<Flex gap={8}>
						<AudioVisualizer
							ref={visualizerRef}
							blob={blob}
							width={240}
							height={75}
							barWidth={1}
							gap={0}
							barColor="#006b35"
						/>
						<Flex
							className={clsx(classes.playAudioContainer, {
								[classes.isMe]: isMe,
							})}
							align="center"
						>
							<Flex
								className={classes.playAudio}
								onClick={() => (isPlay ? handlePause() : handlePlay())}
							>
								<PlayIcon />
							</Flex>
						</Flex>
					</Flex>
					<audio ref={audioRef} src={URL.createObjectURL(blob)} />
				</>
			)}
		</div>
	)
}

export default VisualizerWithPlay
