import { get } from '@vercel/edge-config';
import { NextRequest, NextResponse } from 'next/server';

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|em-breve).*)'],
};

export async function middleware(req: NextRequest) {
    // if (req.nextUrl.pathname.startsWith('/admin')) {
    //     return NextResponse.rewrite(new URL('/', req.url));
    // }

    if (req.nextUrl.pathname.startsWith('/api/payment/webhook')) {
        return NextResponse.next();
    }

    if (!process.env.EDGE_CONFIG) {
        return NextResponse.rewrite(req.nextUrl);
    }

    try {
        // Check whether the maintenance page should be shown
        const isInMaintenanceMode = await get<boolean>('isInMaintenanceMode');

        // If is in maintenance mode, point the url pathname to the maintenance page
        if (isInMaintenanceMode) {
            // req.nextUrl.pathname = `/maintenance`;
            return NextResponse.rewrite(new URL('/em-breve', req.url));
        }
    } catch (error) {
        // show the default page if EDGE_CONFIG env var is missing,
        // but log the error to the console
        console.error(error);
    }
}
