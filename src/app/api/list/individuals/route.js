// File: src/app/api/list/individuals/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const sql = "SELECT Individual_ID, CONCAT(First_Name, ' ', Last_Name) AS Name FROM individual ORDER BY First_Name";
    const individuals = await query({ query: sql });
    return NextResponse.json(individuals);
  } catch (e) {
    return NextResponse.json({ message: e.message }, { status: 500 });
  }
}