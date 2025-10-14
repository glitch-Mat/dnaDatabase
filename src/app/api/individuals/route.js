// File: src/app/api/individuals/route.js

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
  try {
    const sql = 'SELECT Individual_ID, First_Name, Last_Name, Gender FROM individual';
    const individuals = await query({ query: sql });
    return NextResponse.json(individuals);
  } catch (e) {
    // This will print the specific database error to your terminal
    console.error("--- DATABASE ERROR ---", e.message); 
    
    return NextResponse.json({ message: "An error occurred with the database." }, { status: 500 });
  }
}