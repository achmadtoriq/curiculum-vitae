import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const db = getDb();
    const id = body.id || `exp-${Date.now()}`;

    const stmt = db.prepare(`
      INSERT INTO experiences (id, role, company, location, start_date, end_date, current, description, achievements)
      VALUES (@id, @role, @company, @location, @start_date, @end_date, @current, @description, @achievements)
    `);

    stmt.run({
      id,
      role: body.role || '',
      company: body.company || '',
      location: body.location || '',
      start_date: body.start_date || '',
      end_date: body.end_date || '',
      current: body.current ? 1 : 0,
      description: body.description || '',
      achievements: JSON.stringify(Array.isArray(body.achievements) ? body.achievements : [])
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
      UPDATE experiences
      SET role = @role,
          company = @company,
          location = @location,
          start_date = @start_date,
          end_date = @end_date,
          current = @current,
          description = @description,
          achievements = @achievements
      WHERE id = @id
    `);

    stmt.run({
      id: body.id,
      role: body.role || '',
      company: body.company || '',
      location: body.location || '',
      start_date: body.start_date || '',
      end_date: body.end_date || '',
      current: body.current ? 1 : 0,
      description: body.description || '',
      achievements: JSON.stringify(Array.isArray(body.achievements) ? body.achievements : [])
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
    const stmt = db.prepare('DELETE FROM experiences WHERE id = ?');
    stmt.run(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
