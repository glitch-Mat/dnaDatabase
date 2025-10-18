// File: src/app/api/list/medical_analysts/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
export async function GET() {
  const sql = "SELECT Professional_ID, Name FROM professional WHERE Role = 'Medical Analyst'";
  const data = await query({ query: sql });
  return NextResponse.json(data);
}