'use client'
import { SearchOutlined } from '@ant-design/icons'
import { Flex, Skeleton } from 'antd'
import clsx from 'clsx'
import { memo, useCallback, useEffect, useRef, useState } from 'react'

import { useModal } from '@/context/ModalContext'

import { getFriends } from '@/apis/friendApis'

import { isArray, uniqueArray } from '@/ultis/array.ults'
import { cloneDeep, isMobile, toJson } from '@/ultis/common.ults'
import { useLocalePath, useQuery } from '@/ultis/route.ults'

import CInput from '@/Components/Custom/CInput'
import FriendItem from '@/Components/Friend/FriendItem'
import NotFound from '@/svg/NotFound'
import Profile from '../Profile'
import classes from './Friend.module.scss'

import {
	mappingOptionFriends,
	optionFriends,
	paginationCommon,
} from '@/Variable/common.variable'
import { mainRoutes } from '@/routes/MainRoutes'

const Friend = () => {
	const _refFirst = useRef(false)
	const { openError } = useModal()
	const { onChangeRoute } = useLocalePath()
	const { onGetQuerry } = useQuery()
	const { tab } = onGetQuerry() || {}
	const [activeTab, setActiveTab] = useState(
		mappingOptionFriends[tab] || optionFriends[0].value,
	)
	const [searchText, setSearchText] = useState('')
	const [idProfile, setIdProfile] = useState(null)
	const [friendList, setFriendList] = useState({
		[optionFriends[0].value]: [],
		[optionFriends[1].value]: [],
		[optionFriends[2].value]: [],
	})
	const _paginationRefs = useRef({
		[optionFriends[0].value]: cloneDeep(paginationCommon),
		[optionFriends[1].value]: cloneDeep(paginationCommon),
		[optionFriends[2].value]: cloneDeep(paginationCommon),
	})
	const [loading, setLoading] = useState({
		[optionFriends[0].value]: false,
		[optionFriends[1].value]: false,
		[optionFriends[2].value]: false,
	})
	const [total, setTotal] = useState({
		[optionFriends[0].value]: 0,
		[optionFriends[1].value]: 0,
		[optionFriends[2].value]: 0,
	})
	const handleParseParams = useCallback(
		({ type, searchText }: { type: string; searchText: string }) => {
			const { page, limit } = _paginationRefs.current[type] || {}
			const params = {
				fields: ['$all', { user: ['$all'] }, { friend: ['$all'] }],
				where: {
					name: searchText,
				},
				page,
				limit,
				type,
			} as any
			switch (type) {
				case optionFriends[0].value:
					params.where = {
						...params.where,
					}
					break
				default:
					break
			}
			if (type !== optionFriends[0].value) {
				delete params.where.name
			}
			return params
		},
		[],
	)
	const getListFriend = useCallback(
		async (_type: string, searchText: string) => {
			try {
				const type = _type || optionFriends[0].value
				const { page, limit } = _paginationRefs.current[type] || {}
				setLoading((prev) => ({ ...prev, [_type]: true }))
				const isNew = page === 1 && limit === paginationCommon.limit
				if (isNew) {
					setFriendList((prev) => ({ ...prev, [type]: [] }))
				}
				const params = handleParseParams({ type, searchText })
				const res: any = await getFriends({ params })
				const { code, results, pagination } = res || {}
				if (code === 200) {
					const totalPage = Math.ceil(
						pagination?.total / pagination?.limit || 1,
					)
					_paginationRefs.current[type].totalPage = totalPage
					const { rows: data, count } = results?.objects || []

					setFriendList((prev) => {
						const contents = isNew ? [] : prev[type]
						const dataShow = uniqueArray([...contents, ...data], 'id') as any
						return { ...prev, [type]: dataShow }
					})
					setTotal((prev) => ({
						...prev,
						[type]: count || 0,
					}))
				}
			} catch (error) {
				console.error('  error:', error)
				openError(error)
			} finally {
				setLoading((prev) => ({ ...prev, [_type]: false }))
				_refFirst.current = true
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[toJson(friendList)],
	)

	const getAllTotal = useCallback(async () => {
		try {
			const params = {
				page: 1,
				limit: 1,
			}
			const res: any[] = await Promise.all(
				optionFriends.map(({ value }) =>
					getFriends({ params: { ...params, type: value } }),
				),
			)

			setTotal({
				[optionFriends[0].value]: res[0]?.pagination?.total,
				[optionFriends[1].value]: res[1]?.pagination?.total,
				[optionFriends[2].value]: res[2]?.pagination?.total,
			})
		} catch (error) {
			openError(error)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const handleLoadMore = useCallback(async () => {
		const isLoadMore =
			_paginationRefs.current[activeTab].page <
			_paginationRefs.current[activeTab].totalPage
		if (!isLoadMore) return
		_paginationRefs.current[activeTab].page += 1
		await getListFriend(activeTab, searchText)
	}, [activeTab, getListFriend, searchText])
	const handleCallback = useCallback(
		({ tab, type, data }: { tab: string; type: string; data: any }) => {
			const { id: idItem, content } = data || {}
			let contents: any = cloneDeep(friendList[tab] || [])
			const idx = contents.findIndex((item: any) => item?.id === idItem)
			if (idx === -1) {
				return
			}
			switch (tab) {
				case optionFriends[0].value:
					{
						switch (type) {
							case 'unfriend':
								setTotal((prev) => ({ ...prev, [tab]: prev[tab] - 1 }))
								contents = contents.filter((item: any) => item?.id !== idItem)
								if (!isArray(contents, paginationCommon.limit)) {
									_paginationRefs.current[tab].page = 1
									handleLoadMore()
								}
								break
							default:
								break
						}
					}
					break
				case optionFriends[1].value:
					contents = contents.filter((item: any) => item?.id !== idItem)
					switch (type) {
						case 'add':
							setTotal((prev) => ({
								...prev,
								[tab]: prev[tab] - 1,
								[optionFriends[0].value]: prev[optionFriends[0].value] + 1,
							}))
							break
						case 'delete':
							setTotal((prev) => ({
								...prev,
								[tab]: prev[tab] - 1,
							}))
							break
						default:
							break
					}
					if (!isArray(contents, paginationCommon.limit)) {
						_paginationRefs.current[tab].page = 1
						handleLoadMore()
					}
					break
				case optionFriends[2].value:
					{
						switch (type) {
							case 'add':
								contents[idx] = {
									...contents[idx],
									deleted: false,
									id: content.id,
								}
								break
							case 'delete':
								setTotal((prev) => ({ ...prev, [tab]: prev[tab] - 1 }))
								contents[idx] = {
									...contents[idx],
									deleted: true,
								}
								break
							default:
								break
						}
					}
					break
				default:
					break
			}
			setFriendList((prev) => ({ ...prev, [tab]: contents }))
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[toJson(friendList), handleLoadMore],
	)
	const handleScroll = useCallback(
		(e) => {
			const clientHeight = e.target.clientHeight
			const scrollHeight = e.target.scrollHeight
			const scrollTop = Math.abs(e.target.scrollTop)
			const fetchingList = loading[activeTab]
			const isReachedEnd = scrollTop + clientHeight >= scrollHeight - 50
			if (fetchingList || !isReachedEnd) return
			handleLoadMore()
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[activeTab, handleLoadMore, toJson(loading)],
	)

	useEffect(() => {
		getAllTotal()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
	useEffect(() => {
		_refFirst.current = false
		_paginationRefs.current[activeTab].page = 1
		getListFriend(activeTab, searchText)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeTab])

	useEffect(() => {
		let id = null as any
		if (_refFirst.current) {
			id = setTimeout(() => {
				_paginationRefs.current[activeTab].page = 1
				getListFriend(activeTab, searchText)
			}, 500) // 2s
		}
		return () => {
			clearTimeout(id)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchText])
	const _renderLeft = () => {
		return (
			<Flex className={classes.left} vertical>
				<Flex className={classes.leftTop}>
					<Flex className={classes.title}>Friends</Flex>
				</Flex>
				<Flex className={classes.leftMiddle}>
					{optionFriends.map((item) => {
						const { value, label } = item
						const count = total[value]
						return (
							<Flex
								key={value}
								className={clsx(classes.optionFriends, {
									[classes.active]: value === activeTab,
								})}
								onClick={() => setActiveTab(value)}
							>
								{label} ({count})
							</Flex>
						)
					})}
				</Flex>
				<Flex className={classes.leftBottom} vertical>
					{activeTab === optionFriends[0].value && (
						<Flex className={classes.search}>
							<CInput
								placeholder="Search"
								value={searchText}
								style={{ borderRadius: 40, height: 40 }}
								prefix={<SearchOutlined className={classes.iconSearch} />}
								onChange={(e) => setSearchText(e.target.value)}
							/>
						</Flex>
					)}
					<Flex
						className={classes.itemWrapper}
						vertical
						onScroll={handleScroll}
					>
						{isArray(friendList[activeTab], 1)
							? friendList[activeTab]?.map((item) => {
									const { id } = item || {}
									const { user, friend } = item || {}
									const dataShow =
										activeTab === optionFriends[1].value ? user : friend
									const { id: _id } = dataShow || {}
									return (
										<Flex
											key={id}
											className={classes.itemContainer}
											onClick={() =>
												isMobile()
													? onChangeRoute(mainRoutes.profile + `/${_id}`)
													: setIdProfile(_id)
											}
										>
											<FriendItem
												item={item}
												type={activeTab}
												onCallback={handleCallback}
											/>
										</Flex>
									)
								})
							: !loading[activeTab] && (
									<Flex className={classes.notFound} vertical>
										<NotFound />
										<div className={classes.title}>No results found</div>
										<span>Do you want to explore more friends?</span>
										{/* <Flex
											className={classes.exploreButton}
											onClick={() => onChangeRoute(mainRoutes.search)}
										>
											<CButton ctype="oranger">Explore now</CButton>
										</Flex> */}
									</Flex>
								)}
						{loading[activeTab] &&
							Array.from({ length: 4 }).map((_, index) => (
								<Skeleton.Input
									key={index}
									style={{ width: 'calc(100% - 32px)', margin: '8px 16px' }}
								/>
							))}
					</Flex>
				</Flex>
			</Flex>
		)
	}
	const _renderRight = () => {
		return (
			<Flex className={classes.right}>
				{idProfile ? (
					<Profile id={idProfile} isMinimize />
				) : (
					<Flex className={classes.notFound} vertical>
						<NotFound />
						<div className={classes.title}>No results found</div>
						<span>Select people's names to preview their profile.</span>
					</Flex>
				)}
			</Flex>
		)
	}
	return (
		<Flex className={classes.wrapper}>
			{_renderLeft()}
			{_renderRight()}
		</Flex>
	)
}

export default memo(Friend)
