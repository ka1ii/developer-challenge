import { NextRequest, NextResponse } from 'next/server';
export function middleware(req: NextRequest) {
  // check if username is set, ? operator is to prevent error if username is not set
  const username = req.cookies.get('username')?.value

  const url = req.nextUrl.clone();
  
  if (!username && url.pathname !== '/login') {
      url.pathname = '/login';
      return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/((?!_next|favicon.ico).*)', // Apply to all paths except static files
};
