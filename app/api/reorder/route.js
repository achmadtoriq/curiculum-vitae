import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function POST(request) {
  try {
    const { table, items } = await request.json();

    const allowedTables = ['experiences', 'education', 'skills', 'projects'];
    if (!allowedTables.includes(table)) {
      return NextResponse.json({ success: false, error: 'Invalid table specified' }, { status: 400 });
    }

    if (!Array.isArray(items)) {
      return NextResponse.json({ success: false, error: 'Items array is required' }, { status: 400 });
    }

    const db = getDb();
    const updateStmt = db.prepare(`UPDATE ${table} SET display_order = ? WHERE id = ?`);

    const transaction = db.transaction((reorderedItems) => {
      reorderedItems.forEach((item, index) => {
        updateStmt.run(index, item.id);
      });
    });

    transaction(items);

    return NextResponse.json({ success: true, message: 'Reordered successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
