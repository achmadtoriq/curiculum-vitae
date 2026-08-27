import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';

export const dynamic = 'force-static';

export async function GET() {
  try {
    const username = await getAuthSession();
    if (!username) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    return NextResponse.json({ authenticated: true, username });
  } catch (error) {
    return NextResponse.json({ authenticated: false, error: error.message }, { status: 500 });
  }
}
