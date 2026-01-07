import {
	IconBrandMessengerFilled,
	IconCircleCheckFilled,
	IconUserMinus,
	IconUserPlus,
	IconXboxXFilled,
} from '@tabler/icons-react'
import { Flex } from 'antd'
import clsx from 'clsx'
import { useCallback } from 'react'

import useFriendItem from '@/hooks/Friend/useFriendItem'

import { useLocalePath } from '@/ultis/route.ults'

import CAvatar from '@/Components/Custom/CAvatar'
import UserMoreAction from '@/Components/User/UserMoreAction'
import { optionFriends } from '@/Variable/common.variable'

import { mainRoutes } from '@/routes/MainRoutes'

import classes from './FriendItem.module.scss'

interface FriendItemProps {
	item?: any
	type?: string
	onCallback: any
	[key: string]: any
}
const FriendItem = (_props: FriendItemProps) => {
	const { item, type, onCallback } = _props || {}
	const { onChangeRoute } = useLocalePath()
	const { loading, onAccept, onCancel, onAdd } = useFriendItem({})
	const { user, friend } = item || {}
	const dataShow = type === optionFriends[1].value ? user : friend
	const { avatar, name, id } = dataShow || {}
	const _renderRight = useCallback(() => {
		const { id: idItem, deleted } = item || {}
		let contentOther = <></>
		switch (type) {
			case optionFriends[0].value:
				contentOther = (
					<Flex>
						<IconBrandMessengerFilled
							className={classes.iconMess}
							onClick={() => onChangeRoute(`${mainRoutes.inbox}/${id}`)}
						/>
					</Flex>
				)
				break
			case optionFriends[1].value:
				contentOther = (
					<>
						<Flex className={classes.wrapperIconCancel}>
							<IconXboxXFilled
								className={clsx(classes.iconCancel, {
									[classes.disabled]: loading,
								})}
								onClick={(e) => {
									e.stopPropagation()
									onCancel({
										id: idItem,
										onCallback: () =>
											onCallback({ tab: type, data: { id: idItem } }),
									})
								}}
							/>
						</Flex>
						<Flex>
							<IconCircleCheckFilled
								className={clsx(classes.iconAccept, {
									[classes.disabled]: loading,
								})}
								onClick={(e) => {
									e.stopPropagation()
									onAccept({
										id: idItem,
										onCallback: () =>
											onCallback({ tab: type, data: { id: idItem } }),
									})
								}}
							/>
						</Flex>
					</>
				)
				break
			case optionFriends[2].value:
				contentOther = (
					<Flex>
						{deleted ? (
							<IconUserPlus
								className={clsx(classes.iconPeoplePlus, {
									[classes.disabled]: loading,
								})}
								onClick={(e) => {
									e.stopPropagation()
									onAdd({
										id: id,
										onCallback: (content) =>
											onCallback({
												tab: type,
												type: 'add',
												data: { id: idItem, content },
											}),
									})
								}}
							/>
						) : (
							<IconUserMinus
								className={clsx(classes.iconPeopleMinus, {
									[classes.disabled]: loading,
								})}
								onClick={(e) => {
									e.stopPropagation()
									onCancel({
										id: idItem,
										onCallback: () =>
											onCallback({
												tab: type,
												type: 'delete',
												data: { id: idItem },
											}),
									})
								}}
							/>
						)}
					</Flex>
				)
				break
			default:
				return <div></div>
		}
		return (
			<Flex className={classes.right}>
				{contentOther}
				<Flex>
					<UserMoreAction
						id={id}
						isFriend={type === optionFriends[0].value ? item : null}
						onCallback={(data) => onCallback({ ...data, tab: type })}
					/>
				</Flex>
			</Flex>
		)
	}, [
		id,
		item,
		loading,
		onAccept,
		onAdd,
		onCallback,
		onCancel,
		onChangeRoute,
		type,
	])
	return (
		<Flex className={classes.wrapper}>
			<Flex className={classes.left}>
				<CAvatar src={avatar} />
				<div>{name}</div>
			</Flex>
			{_renderRight()}
		</Flex>
	)
}

export default FriendItem
