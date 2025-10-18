// File: src/app/api/data/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// --- GET Function (to read data) ---
// This function remains unchanged.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tableName = searchParams.get('table');
  if (!tableName) return NextResponse.json({ message: 'Table name is required' }, { status: 400 });
  try {
    const tablesResult = await query({ query: 'SHOW TABLES' });
    const dbKey = `Tables_in_${process.env.DB_DATABASE}`;
    const allowedTables = tablesResult.map(row => row[dbKey]);
    if (!allowedTables.includes(tableName)) return NextResponse.json({ message: 'Invalid table name' }, { status: 400 });
    const sql = `SELECT * FROM \`${tableName}\``;
    const data = await query({ query: sql });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ message: e.message }, { status: 500 });
  }
}

// --- POST Function (to insert data) ---
// This function remains unchanged.
export async function POST(request) {
  const { searchParams } = new URL(request.url);
  const tableName = searchParams.get('table');
  const newData = await request.json();
  if (!tableName) return NextResponse.json({ message: 'Table name is required' }, { status: 400 });
  try {
    const tablesResult = await query({ query: 'SHOW TABLES' });
    const dbKey = `Tables_in_${process.env.DB_DATABASE}`;
    const allowedTables = tablesResult.map(row => row[dbKey]);
    if (!allowedTables.includes(tableName)) return NextResponse.json({ message: 'Invalid table name' }, { status: 400 });
    const sql = `INSERT INTO ?? SET ?`;
    const result = await query({ query: sql, values: [tableName, newData] });
    return NextResponse.json({ message: 'Data inserted successfully!', result }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ message: e.message }, { status: 500 });
  }
}

// --- NEW PUT Function (to update data) ---
export async function PUT(request) {
  const { searchParams } = new URL(request.url);
  const tableName = searchParams.get('table');
  // We expect the frontend to send the ID, the primary key column name, and the new data
  const { id, primaryKeyColumn, updateData } = await request.json();

  if (!tableName || !id || !primaryKeyColumn) {
    return NextResponse.json({ message: 'Table name, record ID, and primary key column are required' }, { status: 400 });
  }

  try {
    const sql = `UPDATE ?? SET ? WHERE ?? = ?`;
    const result = await query({
      query: sql,
      values: [tableName, updateData, primaryKeyColumn, id],
    });
    return NextResponse.json({ message: 'Data updated successfully!', result });
  } catch (e) {
    return NextResponse.json({ message: e.message }, { status: 500 });
  }
}

// --- NEW DELETE Function (to remove data) ---
export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const tableName = searchParams.get('table');
  // We expect the frontend to send the ID and the name of the primary key column
  const { id, primaryKeyColumn } = await request.json();

  if (!tableName || !id || !primaryKeyColumn) {
    return NextResponse.json({ message: 'Table name, record ID, and primary key column are required' }, { status: 400 });
  }

  try {
    const sql = `DELETE FROM ?? WHERE ?? = ?`;
    const result = await query({
      query: sql,
      values: [tableName, primaryKeyColumn, id],
    });
    if (result.affectedRows === 0) {
      return NextResponse.json({ message: 'Record not found.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Record deleted successfully!' });
  } catch (e) {
    return NextResponse.json({ message: e.message }, { status: 500 });
  }
}