import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { hashPassword, setAuthCookie } from '@/lib/auth';

export const dynamic = 'force-static';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'Username and password are required' }, { status: 400 });
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid username or password' }, { status: 401 });
    }

    const inputHash = hashPassword(password);
    if (inputHash !== user.password_hash) {
      return NextResponse.json({ success: false, error: 'Invalid username or password' }, { status: 401 });
    }

    // Set secure HTTP-Only auth session cookie
    await setAuthCookie(user.username);

    return NextResponse.json({ success: true, message: 'Login successful', username: user.username });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
