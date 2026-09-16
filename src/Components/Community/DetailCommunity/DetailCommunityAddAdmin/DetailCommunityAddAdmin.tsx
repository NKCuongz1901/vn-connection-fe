import { Flex } from 'antd'
import { memo, useEffect, useState } from 'react'
import { SearchOutlined } from '@ant-design/icons'

import { useModal } from '@/context/ModalContext'

import {
	getConvMembersNotAdmById,
	updateRoleUser,
} from '@/apis/conversationApis'

import CAvatar from '@/Components/Custom/CAvatar'
import CButton from '@/Components/Custom/CButton'
import CInput from '@/Components/Custom/CInput'
import CModal from '@/Components/Custom/CModal/CModal'

import classes from './DetailCommunityAddAdmin.module.scss'

interface DetailCommunityAddAdminProps {
	data?: any
	onClose: () => void
	onSuccess?: (data: any) => void
}

const DetailCommunityAddAdmin = ({
	data,
	onClose,
	onSuccess,
}: DetailCommunityAddAdminProps) => {
	const { id } = data || {}
	const { openError, openSuccess } = useModal()
	const [searchText, setSearchText] = useState('')
	const [loading, setLoading] = useState(false)
	const [memberIds, setMemberIds] = useState<Record<string, any>>({})
	const [members, setMembers] = useState([])
	const handleGetListMember = async (isNotLoading = false) => {
		if (!isNotLoading) setLoading(true)
		try {
			const payload = {
				page: 1,
				limit: 50,
				...(searchText && { name: searchText }),
			}
			const res: any = await getConvMembersNotAdmById({ id, ...payload })
			const { rows } = res?.results?.objects || {}
			setMembers(rows || [])
		} catch (error) {
			openError(error)
		} finally {
			setLoading(false)
		}
	}

	const handleUpdateRoleUser = async ({ member_id }) => {
		setMemberIds((prev) => ({ ...prev, [member_id]: member_id }))
		try {
			await updateRoleUser({
				id,
				payload: {
					member_id,
					role: 'ADMIN',
				},
			})
			handleGetListMember(true)
			openSuccess({
				message: `Add administration successfull`,
			})
			onSuccess({ key: 'addAdmin', value: { member_id } })
		} catch (error) {
			openError(error)
		} finally {
			setMemberIds((prev) => {
				const { [member_id]: _memberId, ..._prev } = prev
				return _prev
			})
		}
	}

	useEffect(() => {
		const id = setTimeout(() => {
			handleGetListMember()
		}, 500)
		return () => {
			clearTimeout(id)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchText])
	return (
		<div className={classes.wrapper}>
			<CModal
				onClose={onClose}
				onCancel={onClose}
				title={'Add admin'}
				styles={{
					content: {
						width: 800,
					},
				}}
				footer={[<div key="back"></div>]}
			>
				<div className={classes.container}>
					<Flex className={classes.wrapperModal}>
						<Flex className={classes.search}>
							<CInput
								placeholder="Search"
								value={searchText}
								style={{ borderRadius: 40, height: 40 }}
								prefix={<SearchOutlined className={classes.iconSearch} />}
								onChange={(e) => setSearchText(e.target.value)}
							/>
						</Flex>
						<div className={classes.title}>Members list suggestions</div>
						<Flex vertical className={classes.memberList}>
							{loading ? (
								<div>Loading</div>
							) : (
								members.map((member) => {
									const { user_id, user } = member || {}
									if (!user) return null
									const { avatar, name } = user
									return (
										<Flex key={user_id} className={classes.memberWrapper}>
											<Flex className={classes.memberLeft}>
												<CAvatar src={avatar} size={40} />
												<div>{name}</div>
											</Flex>
											<div className={classes.bnt}>
												<CButton
													ctype="oranger"
													disabled={!!memberIds[user_id]}
													onClick={() =>
														handleUpdateRoleUser({ member_id: user_id })
													}
												>
													Invite
												</CButton>
											</div>
										</Flex>
									)
								})
							)}
						</Flex>
					</Flex>
				</div>
			</CModal>
		</div>
	)
}

export default memo(DetailCommunityAddAdmin)
