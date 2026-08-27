import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const now = new Date().toISOString();
    const sessionToken = session.user.sessionToken;

    if (sessionToken) {
      db.prepare(`
        UPDATE sessions
        SET last_active_at = ?
        WHERE session_token = ?
      `).run(now, sessionToken);
    } else {
      db.prepare(`
        UPDATE sessions
        SET last_active_at = ?
        WHERE username = ?
      `).run(now, session.user.username);
    }

    return NextResponse.json({ success: true, updated_at: now });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Database session update failed' }, { status: 500 });
  }
}
