// File: src/app/api/data/route.js

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tableName = searchParams.get('table');

  if (!tableName) {
    return NextResponse.json({ message: 'Table name is required' }, { status: 400 });
  }

  try {
    // SECURITY CHECK: This part is crucial. We get a list of all valid tables.
    const tablesResult = await query({ query: 'SHOW TABLES' });
    const dbKey = `Tables_in_${process.env.DB_DATABASE}`;
    const allowedTables = tablesResult.map(row => row[dbKey]);

    // If the requested table name is not in our list of valid tables, we reject it.
    if (!allowedTables.includes(tableName)) {
      return NextResponse.json({ message: 'Invalid table name' }, { status: 400 });
    }

    // --- THIS IS THE FIX ---
    // Because we've validated the tableName, we can now safely build the query string.
    const sql = `SELECT * FROM \`${tableName}\``;

    // We no longer pass values separately for this query.
    const data = await query({ query: sql });
    // --- END OF FIX ---

    return NextResponse.json(data);
  } catch (e) {
    console.error("--- DATABASE ERROR ---", e.message);
    return NextResponse.json({ message: e.message }, { status: 500 });
  }
}