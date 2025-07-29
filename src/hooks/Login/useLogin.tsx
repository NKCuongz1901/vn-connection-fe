import md5 from 'md5'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { useLoading } from '@/context/LoadingContext'
import { useModal } from '@/context/ModalContext'

import { loginByPhone } from '@/apis/authApis'

import { delay, formatPhone, toJson } from '@/ultis/common.ults'
import { useLocalePath } from '@/ultis/route.ults'
import { handleStorageCookie, isLogin } from '@/ultis/storage.ults'

import { mainRoutes } from '@/routes/MainRoutes'
import { io } from 'socket.io-client'

export default function useLogin() {
	const { toggleLoadingContext } = useLoading()
	const { openError } = useModal()
	const { onChangeRoute } = useLocalePath()
	const [account, setAccount] = useState({
		phone: '',
		password: '',
		isRemember: true,
		prefix: '+84',
	})
	const handleSocket = () => {
		const _socket = io('http://dev-api.univini.com:9001', {
			transports: ['websocket'],
			query: {
				token:
					'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJwYXlsb2FkIjp7InVzZXJfaWQiOiJlMTEwNDM2MC0wNzIxLTExZjAtYjM4NC0zZDI5ZmM4OWUyMTUiLCJyb2xlIjoiVVNFUiIsInR5cGUiOiJBQ0NFU1NfVE9LRU4iLCJuYW1lIjoiMTEyMyJ9LCJyb2xlIjoiVVNFUiIsImV4cCI6IjIwMjUtMDctMjVUMDA6NTU6NTEuNjQ3WiJ9.AewMq8uNCStuU-ckZSYCxvofYfCivwTEv3wVG9rZlfY',
				uid: 'e1104360-0721-11f0-b384-3d29fc89e215',
			},
		})
	}
	// useEffect(() => {
	// 	const socket = io('http://dev-api.univini.com:9001', {
	// 		transports: ['websocket'],
	// 		query: {
	// 			token:
	// 				'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJwYXlsb2FkIjp7InVzZXJfaWQiOiJlMTEwNDM2MC0wNzIxLTExZjAtYjM4NC0zZDI5ZmM4OWUyMTUiLCJyb2xlIjoiVVNFUiIsInR5cGUiOiJBQ0NFU1NfVE9LRU4iLCJuYW1lIjoiMTEyMyJ9LCJyb2xlIjoiVVNFUiIsImV4cCI6IjIwMjUtMDctMjVUMDA6NTU6NTEuNjQ3WiJ9.AewMq8uNCStuU-ckZSYCxvofYfCivwTEv3wVG9rZlfY',
	// 			uid: 'e1104360-0721-11f0-b384-3d29fc89e215',
	// 		},
	// 	})
	// }, [])
	const isValidate = useMemo(() => {
		const { phone, password } = account
		return phone.length >= 9 && password.length >= 8
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toJson(account)])

	const handleChange = useCallback(
		(key: string) => (_value: string | any) => {
			let value = _value
			switch (key) {
				case 'phone':
					value = _value.replace(/[^0-9]/g, '')
					break
				default:
					break
			}
			setAccount((pre) => ({
				...pre,
				[key]: value,
			}))
		},
		[],
	)

	const handleLogin = async () => {
		const { phone, password, prefix, isRemember } = account
		toggleLoadingContext(true)
		try {
			const payload = {
				phone: formatPhone(prefix, phone),
				password: md5(password),
			}
			const res: any = await loginByPhone(payload)

			if (res.code === 200) {
				const { object, refresh_token, token } = res.results || {}
				if (isRemember) {
					handleStorageCookie({ key: 'info', data: object, expireInDays: 300 })
					handleStorageCookie({
						key: 'refresh_token',
						data: refresh_token,
						expireInDays: 300,
					})
					handleStorageCookie({ key: 'token', data: token, expireInDays: 300 })
				} else {
					handleStorageCookie({ key: 'info', data: object })
					handleStorageCookie({
						key: 'refresh_token',
						data: refresh_token,
					})
					handleStorageCookie({ key: 'token', data: token })
				}
				await delay(100)
				onChangeRoute(mainRoutes.overview)
			}
		} catch (error: any) {
			openError(error)
		} finally {
			toggleLoadingContext(false)
		}
	}
	useEffect(() => {
		if (isLogin()) return onChangeRoute(mainRoutes.overview)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
	return {
		isValidate,
		account,
		onChange: handleChange,
		onLogin: handleLogin,
		handleSocket,
	}
}
