import { Flex, Skeleton } from 'antd'
import clsx from 'clsx'
import { memo, useEffect, useState } from 'react'

import { useModal } from '@/context/ModalContext'

import { getConvMembersById } from '@/apis/conversationApis'

import { arrayFrom } from '@/ultis/array'
import { useLocalePath } from '@/ultis/route'

import CAvatarBandage from '@/Components/Custom/CAvatarBandage'
import StarIcon from '@/svg/Event/StarIcon'

import { ClubMemberProps } from '@/interface/Community/Community.interface'
import { mainRoutes } from '@/routes/MainRoutes'

import classes from './DetailCommunityAdmin.module.scss'
const DetailCommunityAdmin = ({ id }) => {
	const { openError } = useModal()
	const { onChangeRoute } = useLocalePath()
	const [loadingPage, setLoadingPage] = useState(false)
	const [admins, setAdmins] = useState<ClubMemberProps[]>([])

	const handleGetAdminConv = async (isNoLoading = false) => {
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
	useEffect(() => {
		handleGetAdminConv()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id])
	return (
		<div className={classes.wrapper}>
			<Flex className={classes.container} vertical>
				<div className={classes.title}>Admins</div>
				<Flex className={classes.adminList}>
					{!loadingPage ? (
						admins.map((item) => {
							const { user, type } = item || {}
							const { id, name, avatar } = user || {}
							const isOwner = type === 'OWNER'
							return (
								<Flex
									vertical
									key={id}
									className={classes.admin}
									onClick={() => onChangeRoute(`${mainRoutes.profile}/${id}`)}
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
