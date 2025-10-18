// File: src/app/api/tables/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // This is a more direct and reliable query to get base table names.
    const sql = `SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'`;

    const results = await query({ query: sql });

    // The result is an array of objects. The first key in each object is the table name.
    // We need to get the key name dynamically.
    if (results.length === 0) {
        return NextResponse.json([]); // Return empty array if no tables found
    }

    // This dynamically finds the column name that contains the table names.
    const tableNameKey = Object.keys(results[0])[0];
    const tables = results.map(row => row[tableNameKey]);

    return NextResponse.json(tables);
  } catch (e) {
    // This will print the exact database error to your server terminal
    console.error("--- ERROR FETCHING TABLES ---", e.message);

    return NextResponse.json({ message: e.message }, { status: 500 });
  }
}