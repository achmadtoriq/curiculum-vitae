import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export const dynamic = 'force-static';

export async function POST(request) {
  try {
    const body = await request.json();
    const db = getDb();
    const id = body.id || `proj-${Date.now()}`;

    const stmt = db.prepare(`
      INSERT INTO projects (id, title, description, category, image_url, live_url, github_url, tags, featured)
      VALUES (@id, @title, @description, @category, @image_url, @live_url, @github_url, @tags, @featured)
    `);

    stmt.run({
      id,
      title: body.title || '',
      description: body.description || '',
      category: body.category || 'Full-Stack',
      image_url: body.image_url || '/projects/project1.svg',
      live_url: body.live_url || '',
      github_url: body.github_url || '',
      tags: JSON.stringify(Array.isArray(body.tags) ? body.tags : []),
      featured: body.featured ? 1 : 0
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
      UPDATE projects
      SET title = @title,
          description = @description,
          category = @category,
          image_url = @image_url,
          live_url = @live_url,
          github_url = @github_url,
          tags = @tags,
          featured = @featured
      WHERE id = @id
    `);

    stmt.run({
      id: body.id,
      title: body.title || '',
      description: body.description || '',
      category: body.category || 'Full-Stack',
      image_url: body.image_url || '/projects/project1.svg',
      live_url: body.live_url || '',
      github_url: body.github_url || '',
      tags: JSON.stringify(Array.isArray(body.tags) ? body.tags : []),
      featured: body.featured ? 1 : 0
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
    const stmt = db.prepare('DELETE FROM projects WHERE id = ?');
    stmt.run(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
