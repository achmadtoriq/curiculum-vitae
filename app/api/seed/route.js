import { NextResponse } from 'next/server';
import getDb, { seedDatabase, getFullCvData } from '@/lib/db';

export const dynamic = 'force-static';

export async function POST() {
  try {
    const db = getDb();
    seedDatabase(db);
    const data = getFullCvData();
    return NextResponse.json({ success: true, message: 'Database reset to default demo data', data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
