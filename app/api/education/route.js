import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export const dynamic = 'force-static';

export async function POST(request) {
  try {
    const body = await request.json();
    const db = getDb();
    const id = body.id || `edu-${Date.now()}`;

    const stmt = db.prepare(`
      INSERT INTO education (id, degree, institution, location, start_date, end_date, gpa, description)
      VALUES (@id, @degree, @institution, @location, @start_date, @end_date, @gpa, @description)
    `);

    stmt.run({
      id,
      degree: body.degree || '',
      institution: body.institution || '',
      location: body.location || '',
      start_date: body.start_date || '',
      end_date: body.end_date || '',
      gpa: body.gpa || '',
      description: body.description || ''
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
      UPDATE education
      SET degree = @degree,
          institution = @institution,
          location = @location,
          start_date = @start_date,
          end_date = @end_date,
          gpa = @gpa,
          description = @description
      WHERE id = @id
    `);

    stmt.run({
      id: body.id,
      degree: body.degree || '',
      institution: body.institution || '',
      location: body.location || '',
      start_date: body.start_date || '',
      end_date: body.end_date || '',
      gpa: body.gpa || '',
      description: body.description || ''
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
    const stmt = db.prepare('DELETE FROM education WHERE id = ?');
    stmt.run(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
