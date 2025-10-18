// File: src/app/api/list/profiles/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const sql = "SELECT Profile_ID, CONCAT('Profile ', Profile_ID, ' (', Sample_Type, ')') AS ProfileInfo FROM dna_profile ORDER BY Profile_ID";
    const profiles = await query({ query: sql });
    return NextResponse.json(profiles);
  } catch (e) {
    return NextResponse.json({ message: e.message }, { status: 500 });
  }
}