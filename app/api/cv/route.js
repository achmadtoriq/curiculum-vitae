import { NextResponse } from 'next/server';
import getDb, { getFullCvData } from '@/lib/db';

export async function GET() {
  try {
    const data = getFullCvData();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const db = getDb();

    const stmt = db.prepare(`
      UPDATE profile
      SET name = @name,
          title = @title,
          bio = @bio,
          email = @email,
          phone = @phone,
          location = @location,
          avatar_url = @avatar_url,
          github = @github,
          linkedin = @linkedin,
          twitter = @twitter,
          website = @website,
          resume_url = @resume_url
      WHERE id = 1
    `);

    stmt.run({
      name: body.name || '',
      title: body.title || '',
      bio: body.bio || '',
      email: body.email || '',
      phone: body.phone || '',
      location: body.location || '',
      avatar_url: body.avatar_url || '/avatar.jpg',
      github: body.github || '',
      linkedin: body.linkedin || '',
      twitter: body.twitter || '',
      website: body.website || '',
      resume_url: body.resume_url || '#'
    });

    const updatedCv = getFullCvData();
    return NextResponse.json({ success: true, data: updatedCv });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
