import { Flex, Skeleton } from 'antd'
import clsx from 'clsx'
import { memo, useEffect, useMemo, useState } from 'react'

import { useModal } from '@/context/ModalContext'

import { getConvMembersById } from '@/apis/conversationApis'

import { arrayFrom } from '@/ultis/array'
import { useLocalePath } from '@/ultis/route'

import CAvatarBandage from '@/Components/Custom/CAvatarBandage'
import StarIcon from '@/svg/Event/StarIcon'

import { ClubMemberProps } from '@/interface/Community/Community.interface'
import { mainRoutes } from '@/routes/MainRoutes'

import classes from './DetailCommunityAdmin.module.scss'

interface DetailCommunityAdminProps {
	id: string
	admins?: ClubMemberProps[]
	isPublic?: boolean
	onRequireLogin?: () => void
}

const DetailCommunityAdmin = ({
	id,
	admins: publicAdmins,
	isPublic,
	onRequireLogin,
}: DetailCommunityAdminProps) => {
	const { openError } = useModal()
	const { onChangeRoute } = useLocalePath()
	const [loadingPage, setLoadingPage] = useState(false)
	const [admins, setAdmins] = useState<ClubMemberProps[]>([])

	const normalizedPublicAdmins = useMemo(() => {
		if (!isPublic || !publicAdmins?.length) return []
		return publicAdmins.map((item: any) => {
			if (item?.user) return item
			return {
				type: item?.type || 'ADMIN',
				user: item,
			}
		})
	}, [isPublic, publicAdmins])

	const handleGetAdminConv = async (isNoLoading = false) => {
		if (isPublic) return
		if (!isNoLoading) setLoadingPage(true)
		try {
			const res: any = await getConvMembersById({
				id: id,
				fields: ['$all'],
				admins: true,
				page: 1,
				limit: 50,
			})
			setAdmins(res?.results?.objects?.rows || [])
		} catch (error) {
			openError(error)
		} finally {
			setLoadingPage(false)
		}
	}

	const handleProfileClick = (userId: string) => {
		if (isPublic) {
			onRequireLogin?.()
			return
		}
		onChangeRoute(`${mainRoutes.profile}/${userId}`)
	}

	useEffect(() => {
		if (isPublic) {
			setAdmins(normalizedPublicAdmins)
			setLoadingPage(false)
			return
		}
		handleGetAdminConv()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id, isPublic, normalizedPublicAdmins])

	const adminList = isPublic ? normalizedPublicAdmins : admins

	return (
		<div className={classes.wrapper}>
			<Flex className={classes.container} vertical>
				<div className={classes.title}>Admins</div>
				<Flex className={classes.adminList}>
					{!loadingPage ? (
						adminList.map((item) => {
							const { user, type } = item || {}
							const { id, name, avatar } = user || {}
							const isOwner = type === 'OWNER'
							return (
								<Flex
									vertical
									key={id}
									className={classes.admin}
									onClick={() => handleProfileClick(id)}
								>
									<Flex>
										<CAvatarBandage
											src={avatar}
											className={classes.communityAva}
											classBandage={clsx(classes.communityBandage, {
												[classes.communityBandageAdm]: !isOwner,
											})}
											{...(!isOwner && { customeBandage: <StarIcon /> })}
										/>
									</Flex>
									<div className={classes.name}>{name}</div>
								</Flex>
							)
						})
					) : (
						<Flex className={classes.skeletonWrapper}>
							{arrayFrom(2).map((_, index) => (
								<Flex key={index} vertical className={classes.skeleton}>
									<Skeleton.Avatar active className={classes.skeletonAva} />
									<Skeleton.Input active className={classes.skeletonInput} />
								</Flex>
							))}
						</Flex>
					)}
				</Flex>
			</Flex>
		</div>
	)
}

export default memo(DetailCommunityAdmin)
