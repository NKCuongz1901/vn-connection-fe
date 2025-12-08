import { Flex } from 'antd'
import dayjs from 'dayjs'
import { useEffect, useRef, useState } from 'react'

import MicroPhoneIcon from '@/svg/MicroPhoneIcon'
import RetryIcon from '@/svg/RetryIcon'
import SendIcon from '@/svg/SendIcon'
import SquareIcon from '@/svg/SquareIcon'
import CButton from '../Custom/CButton'
import VisualizerWithPlay from '../VisualizerWithPlay'

import classes from './AudioRecorder.module.scss'

interface AudioRecorderProps {
	onClose?: any
	onComplete?: any
}

export default function AudioRecorder(props: AudioRecorderProps) {
	const { onClose = () => null, onComplete = () => null } = props
	const [recording, setRecording] = useState(false)
	const [timeLeft, setTimeLeft] = useState(0)
	const [audioURL, setAudioURL] = useState('')
	const mediaRecorderRef = useRef(null)
	const audioChunksRef = useRef([])
	const timerRef = useRef(null)
	const [audio, setAudio] = useState<File>(null)

	const handleFormatTime = (s) => dayjs(s * 1000).format('mm:ss')

	useEffect(() => {
		let countdown
		if (recording) {
			countdown = setInterval(() => {
				setTimeLeft((prev) => {
					if (prev >= 60) {
						stopRecording()
						return 0
					}
					return prev + 1
				})
			}, 1000)
		}
		return () => clearInterval(countdown)
	}, [recording])

	const startRecording = async () => {
		const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
		mediaRecorderRef.current = new MediaRecorder(stream)
		audioChunksRef.current = []
		setTimeLeft(0)
		setAudioURL('')

		mediaRecorderRef.current.ondataavailable = (e) => {
			if (e.data.size > 0) audioChunksRef.current.push(e.data)
		}

		mediaRecorderRef.current.onstop = () => {
			clearTimeout(timerRef.current)
			const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
			const file = new File([blob], `recording_${Date.now()}.wav`, {
				type: 'audio/wav',
			})
			const url = URL.createObjectURL(file)
			setAudioURL(url)
			setAudio(file) // trả ra file thực thụ
		}

		mediaRecorderRef.current.start()
		setRecording(true)

		timerRef.current = setTimeout(() => {
			if (
				mediaRecorderRef.current &&
				mediaRecorderRef.current.state === 'recording'
			) {
				stopRecording()
			}
		}, 60_000)
	}

	const stopRecording = () => {
		if (
			mediaRecorderRef.current &&
			mediaRecorderRef.current.state === 'recording'
		) {
			mediaRecorderRef.current.stop()
		}
		setRecording(false)
		clearTimeout(timerRef.current)
	}
	const onReset = () => {
		setAudio(null)
		setAudioURL(null)
		setRecording(false)
	}
	const _renderTop = () => {
		let content
		switch (true) {
			case recording:
				content = (
					<Flex
						vertical
						className={classes.recordDuring}
						onClick={stopRecording}
					>
						<Flex align="center" className={classes.record}>
							<div className={classes.redDot} />
							{handleFormatTime(timeLeft)}
						</Flex>
					</Flex>
				)
				break
			case !!audio:
				content = (
					<Flex className={classes.recordAfter}>
						<Flex className={classes.audio}>
							<VisualizerWithPlay src={audioURL} />
						</Flex>
					</Flex>
				)
				break
			default:
				content = (
					<Flex
						vertical
						className={classes.recordBefore}
						onClick={startRecording}
					>
						<MicroPhoneIcon />
						<div className={classes.title}>Tap to record your voice</div>
						<div className={classes.text}>Maximum 1 minute</div>
					</Flex>
				)
				break
		}
		return <Flex className={classes.top}>{content}</Flex>
	}
	const _renderBottom = () => {
		return (
			<Flex className={classes.bottom}>
				<div className={classes.btn}>
					<CButton
						disabled={recording}
						ctype="disabled"
						onClick={!!audio ? onReset : onClose}
					>
						{!!audio ? <RetryIcon /> : 'X'}
					</CButton>
				</div>
				<div className={classes.btn}>
					<CButton
						disabled={!!audio}
						ctype={recording ? 'danger' : 'oranger'}
						onClick={recording ? stopRecording : startRecording}
					>
						{recording || !!audio ? (
							<SquareIcon />
						) : (
							<MicroPhoneIcon fill="#fff" />
						)}
					</CButton>
				</div>
				<div className={classes.btn}>
					<CButton
						disabled={!audio || recording}
						ctype={audio ? 'oranger' : 'disabled'}
						onClick={() => {
							onComplete(audio)
							onClose()
						}}
					>
						<SendIcon fill={audio ? '#fff' : '#94A3B8'} />
					</CButton>
				</div>
			</Flex>
		)
	}
	return (
		<div className={classes.wrapper}>
			<Flex className={classes.container} vertical>
				{_renderTop()}
				{_renderBottom()}
			</Flex>
		</div>
	)
}
