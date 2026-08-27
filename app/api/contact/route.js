import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export const dynamic = 'force-static';

export async function POST(request) {
  try {
    const body = await request.json();
    const db = getDb();
    const id = `msg-${Date.now()}`;
    const createdAt = new Date().toISOString();

    if (!body.name || !body.email || !body.message) {
      return NextResponse.json({ success: false, error: 'Name, email, and message are required' }, { status: 400 });
    }

    const stmt = db.prepare(`
      INSERT INTO messages (id, name, email, subject, message, created_at)
      VALUES (@id, @name, @email, @subject, @message, @created_at)
    `);

    stmt.run({
      id,
      name: body.name,
      email: body.email,
      subject: body.subject || 'General Inquiry',
      message: body.message,
      created_at: createdAt
    });

    return NextResponse.json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const db = getDb();
    const messages = db.prepare('SELECT * FROM messages ORDER BY created_at DESC').all();
    return NextResponse.json({ success: true, messages });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    const db = getDb();
    const stmt = db.prepare('DELETE FROM messages WHERE id = ?');
    stmt.run(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
