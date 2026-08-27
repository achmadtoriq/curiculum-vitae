import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export const dynamic = 'force-static';

export async function POST(request) {
  try {
    const body = await request.json();
    const db = getDb();
    const id = body.id || `sk-${Date.now()}`;

    const stmt = db.prepare(`
      INSERT INTO skills (id, name, category, proficiency, icon)
      VALUES (@id, @name, @category, @proficiency, @icon)
    `);

    stmt.run({
      id,
      name: body.name || '',
      category: body.category || 'General',
      proficiency: Number(body.proficiency) || 80,
      icon: body.icon || 'Code'
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const db = getDb();

    const stmt = db.prepare(`
      UPDATE skills
      SET name = @name,
          category = @category,
          proficiency = @proficiency,
          icon = @icon
      WHERE id = @id
    `);

    stmt.run({
      id: body.id,
      name: body.name || '',
      category: body.category || 'General',
      proficiency: Number(body.proficiency) || 80,
      icon: body.icon || 'Code'
    });

    return NextResponse.json({ success: true });
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
    const stmt = db.prepare('DELETE FROM skills WHERE id = ?');
    stmt.run(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
