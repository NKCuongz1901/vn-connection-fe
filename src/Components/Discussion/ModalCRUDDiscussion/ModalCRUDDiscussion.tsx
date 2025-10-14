import { IconCircleXFilled } from '@tabler/icons-react'
import { Flex } from 'antd'
import { memo } from 'react'

import { useLoading } from '@/context/LoadingContext'
import useModalCRUDDiscussion from '@/hooks/Discussion/useModalCRUDDiscussion'

import CButton from '@/Components/Custom/CButton'
import CImage from '@/Components/Custom/CImage'
import CInput from '@/Components/Custom/CInput'
import CModal from '@/Components/Custom/CModal/CModal'
import CSelect from '@/Components/Custom/CSelect'
import CTextArea from '@/Components/Custom/CTextArea'
import CUploadMuti from '@/Components/Custom/CUploadMuti'
import ImageIcon from '@/svg/ImageIcon'

import classes from './ModalCRUDDiscussion.module.scss'

interface ModalCRUDDiscussionProps {
	open: boolean
	conversation_id?: string
	topic?: any[]
	data?: any
	onClose: any
	onSuccess?: any
	[key: string]: any
}
const ModalCRUDDiscussion = (props: ModalCRUDDiscussionProps) => {
	const { loadingContext } = useLoading()
	const { conversation_id, data, onClose = () => null } = props || {}

	const {
		dataSubmit,
		error,
		categoryOption,
		fileList,
		setFileList,
		onSubmit,
		onChangeValue,
		onImportImg,
	} = useModalCRUDDiscussion(props)
	const { id, category } = data || {}
	const { title, category_id, medias, description } = dataSubmit || {}
	return (
		<div className={classes.wrapper}>
			<CModal
				onClose={onClose}
				onCancel={onClose}
				title={id ? 'Edit discussion' : 'Create discussion'}
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
							{id ? 'Edit discussion' : 'Create discussion'}
						</CButton>
					</Flex>,
				]}
			>
				<div className={classes.container}>
					<Flex className={classes.wrapperModal} vertical>
						{!conversation_id && (
							<CSelect
								disabled={!!id || !!category?.id}
								label="Topic"
								options={categoryOption}
								value={category_id}
								onChange={onChangeValue('category_id')}
							/>
						)}
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
								{[...medias, ...fileList].map((i) => (
									<Flex
										key={i.imageUrl || i?.url}
										className={classes.chooseImgItem}
									>
										<CImage preview={true} src={i.imageUrl || i?.url} />
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
								))}
							</Flex>
							<Flex className={classes.upload}>
								<CUploadMuti
									maxCount={0}
									fileList={fileList.map((i) => i.file)}
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
export default memo(ModalCRUDDiscussion)
