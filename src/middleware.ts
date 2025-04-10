import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { NextRequest, NextResponse } from 'next/server'

import { exclusiveStartWith, includesPath } from './middlewareData'

export default createMiddleware(routing)

export function middleware(request: NextRequest, _response: NextResponse) {
	const pathname = request.nextUrl.pathname
	if (!exclusiveStartWith.some((i) => pathname.startsWith(i))) {
		const response = NextResponse.next()
		response.headers.set('x-x-pathname', pathname)
		if (pathname.startsWith('/about')) {
		}

		if (pathname.startsWith('/dashboard')) {
		}
		if (!includesPath.some((path) => pathname.includes(path))) {
			const url = request.nextUrl.clone()
			url.pathname = '/en/login'
			return NextResponse.redirect(url)
		}
		return response
	}
}

export const config = {
	// Match only internationalized pathnames
	matcher: ['/', '/(de|en|vi)/:path*'],
}
