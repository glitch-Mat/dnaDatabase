// File: src/app/api/list/conditions/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const sql = "SELECT Condition_ID, Condition_Name FROM genetic_condition ORDER BY Condition_Name";
    const conditions = await query({ query: sql });
    return NextResponse.json(conditions);
  } catch (e) {
    return NextResponse.json({ message: e.message }, { status: 500 });
  }
}