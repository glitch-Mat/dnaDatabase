// File: src/app/api/data/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// --- GET Function (to read data) ---
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tableName = searchParams.get('table');

  if (!tableName) {
    return NextResponse.json({ message: 'Table name is required' }, { status: 400 });
  }

  try {
    const tablesResult = await query({ query: 'SHOW TABLES' });
    const dbKey = `Tables_in_${process.env.DB_DATABASE}`;
    const allowedTables = tablesResult.map(row => row[dbKey]);

    if (!allowedTables.includes(tableName)) {
      return NextResponse.json({ message: 'Invalid table name' }, { status: 400 });
    }

    const sql = `SELECT * FROM \`${tableName}\``;
    const data = await query({ query: sql });
    
    // This is a successful response
    return NextResponse.json(data);
  } catch (e) {
    // This is an error response
    return NextResponse.json({ message: e.message }, { status: 500 });
  }
}

// --- POST Function (to insert data) ---
export async function POST(request) {
  const { searchParams } = new URL(request.url);
  const tableName = searchParams.get('table');
  const newData = await request.json();

  if (!tableName) {
    return NextResponse.json({ message: 'Table name is required' }, { status: 400 });
  }

  try {
    const tablesResult = await query({ query: 'SHOW TABLES' });
    const dbKey = `Tables_in_${process.env.DB_DATABASE}`;
    const allowedTables = tablesResult.map(row => row[dbKey]);
    if (!allowedTables.includes(tableName)) {
      return NextResponse.json({ message: 'Invalid table name' }, { status: 400 });
    }

    const sql = `INSERT INTO ?? SET ?`;
    const result = await query({
      query: sql,
      values: [tableName, newData],
    });

    return NextResponse.json({ message: 'Data inserted successfully!', result }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ message: e.message }, { status: 500 });
  }
}

// --- PUT Function (to update data) ---
export async function PUT(request) {
  const { searchParams } = new URL(request.url);
  const tableName = searchParams.get('table');
  const { id, ...updateData } = await request.json();

  if (!tableName || !id) {
    return NextResponse.json({ message: 'Table name and record ID are required' }, { status: 400 });
  }

  try {
    const sql = `UPDATE ?? SET ? WHERE Professional_ID = ?`;
    const result = await query({
      query: sql,
      values: [tableName, updateData, id],
    });

    return NextResponse.json({ message: 'Data updated successfully!', result });
  } catch (e) {
    console.error("UPDATE ERROR:", e.message);
    return NextResponse.json({ message: e.message }, { status: 500 });
  }
}