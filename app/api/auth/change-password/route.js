import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getAuthSession, hashPassword } from '@/lib/auth';

export async function PUT(request) {
  try {
    const username = await getAuthSession();
    if (!username) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ success: false, error: 'Current and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ success: false, error: 'New password must be at least 6 characters long' }, { status: 400 });
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    if (!user || hashPassword(currentPassword) !== user.password_hash) {
      return NextResponse.json({ success: false, error: 'Current password is incorrect' }, { status: 400 });
    }

    const newHash = hashPassword(newPassword);
    db.prepare('UPDATE users SET password_hash = ? WHERE username = ?').run(newHash, username);

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
