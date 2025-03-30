import CAvatar from '@/Components/Custom/CAvatar'
import CButton from '@/Components/Custom/CButton'
import CInput from '@/Components/Custom/CInput'
import CModal from '@/Components/Custom/CModal/CModal'
import CTextArea from '@/Components/Custom/CTextArea'
import { IconCameraFilled, IconUserFilled } from '@tabler/icons-react'
import { Flex, Image } from 'antd'
import classes from './ModalEditProfile.module.scss'

interface ModalEditProfileProps {
	open: boolean
	onClose: any
	data?: any
	[key: string]: any
}

const ModalEditProfile = (props: ModalEditProfileProps) => {
	const { onClose, open, data } = props
	const { avatar, cover } = data || {}
	console.log('🌸🌸🌸 TrieuNinhHan ~ ModalEditProfile ~ open:', open)
	const _renderTop = () => {
		return (
			<Flex className={classes.top} vertical>
				<Flex className={classes.cover}>
					<Image
						className={classes.image}
						src={cover || '/images/defaultCover.png'}
					/>
					<Flex className={classes.camera}>
						<IconCameraFilled className={classes.iconCamera} />
					</Flex>
				</Flex>
				<Flex className={classes.avatarWrapper}>
					<Flex className={classes.avatar}>
						<CAvatar src={avatar} size={96} />
						<Flex className={classes.camera}>
							<IconCameraFilled className={classes.iconCamera} />
						</Flex>
					</Flex>
				</Flex>
			</Flex>
		)
	}
	return (
		<>
			{open && (
				<CModal
					onClose={onClose}
					onCancel={onClose}
					title="Edit Profile"
					footer={[
						<Flex key="back" justify="flex-end">
							<CButton
								onClick={onClose}
								ctype="disabled"
								style={{ width: 240 }}
							>
								Save Change
							</CButton>
						</Flex>,
					]}
				>
					<Flex className={classes.wrapper} vertical>
						{_renderTop()}
						<Flex>
							<CTextArea
								isRequired
								label="About"
								maxLength={200}
								placeholder="Max length is 200"
							/>
						</Flex>
						<Flex className={classes.bottom}>
							<Flex className={classes.bottomItem}>
								<span>Summary</span>
								<CInput
									prefix={<IconUserFilled />}
									placeholder="Your full name"
								/>
								<CInput />
								<CInput />
								<CInput />
							</Flex>
							<Flex className={classes.bottomItem}>
								<span>Specialties</span>
							</Flex>
						</Flex>
					</Flex>
				</CModal>
			)}
		</>
	)
}

export default ModalEditProfile
