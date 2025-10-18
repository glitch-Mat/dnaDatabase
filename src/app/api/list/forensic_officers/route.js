// File: src/app/api/list/forensic_officers/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
export async function GET() {
  const sql = "SELECT Professional_ID, Name FROM professional WHERE Role = 'Forensic Officer'";
  const data = await query({ query: sql });
  return NextResponse.json(data);
}