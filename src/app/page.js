// File: src/app/page.js
"use client";

import { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function Home() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [tableData, setTableData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. Fetch the list of table names when the component loads
  useEffect(() => {
    async function fetchTables() {
      try {
        const res = await fetch('/api/tables');
        const data = await res.json();
        setTables(data);
        if (data.length > 0) {
          setSelectedTable(data[0]); // Select the first table by default
        }
      } catch (err) {
        setError('Failed to fetch table list.');
      }
    }
    fetchTables();
  }, []);

  // 2. Fetch data for the selected table whenever it changes
  useEffect(() => {
    if (!selectedTable) return;

    async function fetchTableData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/data?table=${selectedTable}`);
        if (!res.ok) throw new Error(`Failed to fetch data for ${selectedTable}`);
        const data = await res.json();
        setTableData(data);
        if (data.length > 0) {
          setColumns(Object.keys(data[0])); // Get column headers from the first row of data
        } else {
          setColumns([]);
        }
      } catch (err) {
        setError(err.message);
        setTableData([]);
        setColumns([]);
      } finally {
        setLoading(false);
      }
    }
    fetchTableData();
  }, [selectedTable]); // This effect re-runs when selectedTable changes

  return (
    <main>
      <h1>DNA Database Explorer</h1>
      
      <div style={{ margin: '20px 0' }}>
        <label htmlFor="table-select" style={{ marginRight: '10px' }}>Select a Table:</label>
        <select 
          id="table-select" 
          value={selectedTable} 
          onChange={(e) => setSelectedTable(e.target.value)}
        >
          {tables.map(table => <option key={table} value={table}>{table}</option>)}
        </select>
      </div>

      {loading && <p>Loading data...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
      {!loading && !error && tableData.length > 0 && (
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map(col => <th key={col}>{col}</th>)}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map(col => <td key={col}>{String(row[col])}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      {!loading && !error && tableData.length === 0 && selectedTable && (
        <p>No data found in table: {selectedTable}</p>
      )}
    </main>
  );
}