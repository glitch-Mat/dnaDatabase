// File: src/app/api/list/professionals/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const sql = "SELECT Professional_ID, Name FROM professional ORDER BY Name";
    const professionals = await query({ query: sql });
    return NextResponse.json(professionals);
  } catch (e) {
    return NextResponse.json({ message: e.message }, { status: 500 });
  }
}