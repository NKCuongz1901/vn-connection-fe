'use client'
import { IconCheck, IconX } from '@tabler/icons-react'
import { Flex, Skeleton } from 'antd'
import clsx from 'clsx'
import { memo } from 'react'

import { useLoading } from '@/context/LoadingContext'
import useHangout from '@/hooks/Hangout/useHangout'

import { isArray } from '@/ultis/array'
import { onPushState } from '@/ultis/route'
import { randomString } from '@/ultis/string'

import CAvatar from '@/Components/Custom/CAvatar'
import CButton from '@/Components/Custom/CButton'
import CSwitch from '@/Components/Custom/CSwitch'
import HangoutChat from '@/Components/Hangout/HangoutChat'
import HangoutTabMy from '@/Components/Hangout/HangoutTabMy'
import HangoutTabOpen from '@/Components/Hangout/HangoutTabOpen'
import ModelChooseHangout from '@/Components/Hangout/ModelChooseHangout'
import ModelMorePeople from '@/Components/Hangout/ModelMorePeople'
import PencilIcon from '@/svg/Hangout/PencilIcon'
import Party from '@/svg/Party'

import classes from './Hangout.module.scss'

const Hangout = () => {
	const { loadingContext } = useLoading()
	const {
		userData,
		_tabsOpenRef,
		modal,
		currentPage,
		setModal,
		postId,
		key,
		myWaitting,
		hangoutPeople,
		totalHangout,
		loadingProfile,

		defaultTitleHangout,

		setCurrentPage,
		onUpdateUserInfo,
		onScroll,
		onActionPart,
		OnChangeTitleHangout,
		onGetMyWaitting,
		onAction,
	} = useHangout()

	const _renderTop = () => {
		const { is_open_hangout, title_open_hangout } = userData
		return (
			<Flex vertical className={classes.top}>
				<Flex className={classes.top1}>
					<Party fill="#006B35" />
					<span className={classes.title}>Hangout</span>
				</Flex>
				<Flex className={classes.top2} vertical>
					{loadingProfile ? (
						<Skeleton.Input active className={classes.skeleton} />
					) : (
						<>
							<Flex vertical gap="4px">
								<Flex className={classes.hangoutPeople}>
									{!!is_open_hangout &&
										hangoutPeople.map((people) => (
											<div key={people.id}>
												<CAvatar src={people.avatar} />
											</div>
										))}
								</Flex>
								<Flex className={classes.switchStatus}>
									<span>
										{totalHangout + Number(is_open_hangout)} people available to
										hangout now
									</span>
									<CSwitch
										value={is_open_hangout}
										disabled={loadingContext}
										ctype="success"
										onChange={(value) =>
											onUpdateUserInfo({ is_open_hangout: value })
										}
									/>
								</Flex>
							</Flex>
							<Flex
								className={classes.titleHangout}
								onClick={() => setModal({ type: 'choose', data: userData })}
							>
								<span>
									{defaultTitleHangout ||
										title_open_hangout ||
										'I want to hang out'}
								</span>
								<Flex>
									<PencilIcon />
								</Flex>
							</Flex>
						</>
					)}
				</Flex>
			</Flex>
		)
	}

	const _renderBottom = () => {
		const arr = ['Open hangout', 'My hangouts']
		return (
			<Flex className={classes.bottom} vertical>
				<Flex className={classes.page}>
					{arr.map((item, index) => (
						<Flex
							key={item}
							onClick={() => setCurrentPage(index)}
							className={classes.pageItem}
						>
							<CButton ctype={index === currentPage ? 'success' : 'disabled'}>
								{item}
							</CButton>
						</Flex>
					))}
				</Flex>

				{currentPage === 0 ? (
					userData.is_open_hangout && <HangoutTabOpen ref={_tabsOpenRef} />
				) : (
					<>
						<HangoutTabMy
							ref={_tabsOpenRef}
							onClick={(id) => {
								key.current = randomString()
								onPushState({ id })
							}}
						/>
					</>
				)}
			</Flex>
		)
	}

	const _renderModal = () => {
		const { type, data } = modal
		let content = <></>
		switch (type) {
			case 'choose':
				content = (
					<ModelChooseHangout
						data={data?.title_open_hangout || ''}
						onClose={() => setModal(null)}
						onSubmit={OnChangeTitleHangout}
					/>
				)
				break
			case 'morePeople':
				content = (
					<ModelMorePeople
						postId={postId}
						onClose={() => {
							setModal(null)
							onGetMyWaitting()
						}}
					/>
				)
				break
			default:
				break
		}
		return content
	}

	const _renderWaitting = () => {
		const item = myWaitting[0]
		if (!item) return null
		return (
			<Flex vertical className={classes.waitingWrapper}>
				<Flex className={classes.waitingItem}>
					<Flex className={classes.waitingItemLeft}>
						<CAvatar src={item?.user?.avatar} />
						<Flex vertical className={classes.nameWrapper}>
							<span className={classes.name}>{item?.user?.name}</span>
							<span className={classes.desc}>Request to join this hangout</span>
						</Flex>
					</Flex>
					<Flex className={classes.btnAction}>
						<Flex
							className={classes.iconCancel}
							onClick={() =>
								onActionPart({
									id: item?.id,
									request_join_status: 'REJECT',
								})
							}
						>
							<IconX />
						</Flex>
						<Flex
							className={classes.iconAccept}
							onClick={() =>
								onActionPart({
									id: item?.id,
									request_join_status: 'ACCEPT',
								})
							}
						>
							<IconCheck />
						</Flex>
					</Flex>
				</Flex>
				<Flex className={classes.waitingOther}>
					<Flex className={classes.waitingOtherText}>
						{myWaitting.length || 0} people Say Hello 👋 to you
					</Flex>
					{isArray(myWaitting, 2) && (
						<Flex
							className={classes.waitingOtherMore}
							onClick={() => setModal({ type: 'morePeople', data: { postId } })}
						>
							Show all
						</Flex>
					)}
				</Flex>
			</Flex>
		)
	}

	return (
		<div className={classes.wrapper}>
			<Flex
				className={clsx(classes.container, { [classes.minify]: postId })}
				onScroll={onScroll}
			>
				{_renderTop()}
				{_renderWaitting()}
				{_renderBottom()}
				{modal?.type && _renderModal()}
			</Flex>
			{postId && (
				<HangoutChat key={key.current} postId={postId} onAction={onAction} />
			)}
		</div>
	)
}

export default memo(Hangout)
