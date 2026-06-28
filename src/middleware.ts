import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'

import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

const LOCALES = ['en', 'de', 'vi'] as const

function hasLocalePrefix(pathname: string) {
	return LOCALES.some(
		(locale) =>
			pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
	)
}

export default function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl

	if (pathname.startsWith('/_next/') || pathname === '/favicon.ico') {
		return NextResponse.next()
	}

	if (!hasLocalePrefix(pathname)) {
		const url = request.nextUrl.clone()
		url.pathname = '/en/overview'
		return NextResponse.redirect(url)
	}

	if (LOCALES.some((locale) => pathname === `/${locale}`)) {
		const url = request.nextUrl.clone()
		url.pathname = `${pathname}/overview`
		return NextResponse.redirect(url)
	}

	const response = intlMiddleware(request)
	response.headers.set('x-x-pathname', pathname)
	return response
}

export const config = {
	matcher: ['/', '/(de|en|vi)/:path*'],
}
