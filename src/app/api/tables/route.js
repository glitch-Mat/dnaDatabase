// File: src/app/api/tables/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const results = await query({ query: 'SHOW TABLES' });

    // The result is an array of objects, we need to flatten it
    const dbKey = `Tables_in_${process.env.DB_DATABASE}`;
    const tables = results.map(row => row[dbKey]);

    return NextResponse.json(tables);
  } catch (e) {
    return NextResponse.json({ message: e.message }, { status: 500 });
  }
}