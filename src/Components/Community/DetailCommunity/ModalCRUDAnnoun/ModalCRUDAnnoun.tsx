import { IconCircleXFilled } from '@tabler/icons-react'
import { Flex } from 'antd'
import { memo } from 'react'

import { useLoading } from '@/context/LoadingContext'

import CButton from '@/Components/Custom/CButton'
import CImage from '@/Components/Custom/CImage'
import CInput from '@/Components/Custom/CInput'
import CModal from '@/Components/Custom/CModal/CModal'
import CTextArea from '@/Components/Custom/CTextArea'
import CUploadMuti from '@/Components/Custom/CUploadMuti'
import ImageIcon from '@/svg/ImageIcon'

import useModalCRUDAnnoun from '@/hooks/Community/useModalCRUDAnnoun'
import classes from './ModalCRUDAnnoun.module.scss'

interface ModalCRUDAnnounProps {
	open: boolean
	topic?: any[]
	data?: any
	onClose: any
	onSuccess?: any
	[key: string]: any
}
const ModalCRUDAnnoun = (props: ModalCRUDAnnounProps) => {
	const { loadingContext } = useLoading()
	const {
		data,
		topic,
		onClose = () => null,
		onSuccess = () => null,
	} = props || {}

	const {
		dataSubmit,
		error,
		fileList,
		setFileList,
		onSubmit,
		onChangeValue,
		onImportImg,
	} = useModalCRUDAnnoun({
		data,
		onSuccess,
		onClose,
		topic,
	})
	const { id } = data || {}
	const { title, medias, description } = dataSubmit || {}
	return (
		<div className={classes.wrapper}>
			<CModal
				onClose={onClose}
				onCancel={onClose}
				title={id ? 'Edit announcement' : 'Create announcement'}
				styles={{
					content: {
						width: 800,
					},
				}}
				footer={[
					<Flex key="back" justify="flex-end">
						<CButton
							disabled={loadingContext}
							onClick={onSubmit}
							ctype="oranger"
							style={{ width: 200 }}
						>
							{id ? 'Edit announcement' : 'Create announcement'}
						</CButton>
					</Flex>,
				]}
			>
				<div className={classes.container}>
					<Flex className={classes.wrapperModal} vertical>
						<CInput
							isRequired
							label="Title"
							value={title}
							error={error.title}
							placeholder="Title"
							onChange={onChangeValue('title')}
						/>
						<CTextArea
							label="Body text"
							placeholder="Body text"
							value={description}
							onChange={onChangeValue('description')}
							maxLength={2000}
							showCount
							rows={5}
						/>
						<Flex className={classes.chooseImg} vertical>
							<Flex className={classes.chooseImgContent} vertical>
								{[...medias, ...fileList].map((i) => {
									const { type, url } = i || {}
									const isImg = type === 'IMAGE'
									return (
										<Flex
											key={i.imageUrl || i?.url}
											className={classes.chooseImgItem}
										>
											{isImg ? (
												<CImage preview={true} src={i.imageUrl || i?.url} />
											) : (
												<video controls>
													<source src={url} type="video/mp4" />
												</video>
											)}
											<Flex
												className={classes.chooseImgCancel}
												onClick={() => {
													setFileList((prev) =>
														prev.filter((prev) => prev.imageUrl !== i.imageUrl),
													)
													onChangeValue('removeImg')(i)
												}}
											>
												<IconCircleXFilled />
											</Flex>
										</Flex>
									)
								})}
							</Flex>
							<Flex className={classes.upload}>
								<CUploadMuti
									maxCount={0}
									fileList={fileList.map((i) => i.file)}
									accept="image/*,video/*"
									onChange={({ file: _file, fileList: newList }) => {
										onImportImg(newList)
									}}
								>
									<ImageIcon /> <span> &nbsp;Add image</span>
								</CUploadMuti>
							</Flex>
						</Flex>
					</Flex>
				</div>
			</CModal>
		</div>
	)
}
export default memo(ModalCRUDAnnoun)
