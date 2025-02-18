import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { NextRequest, NextResponse } from 'next/server'
import { exclusiveStartWith } from './middlewareData'

export default createMiddleware(routing)

export function middleware(request: NextRequest, _response: NextResponse) {
	if (!exclusiveStartWith.some((i) => request.nextUrl.pathname.startsWith(i))) {
		const pathname = request.nextUrl.pathname
		const response = NextResponse.next()
		response.headers.set('x-x-pathname', pathname)
		if (request.nextUrl.pathname.startsWith('/about')) {
		}

		if (request.nextUrl.pathname.startsWith('/dashboard')) {
		}
		return response
	}
}

export const config = {
	// Match only internationalized pathnames
	matcher: ['/', '/(de|en|vi)/:path*'],
}
