// File: src/app/page.js
"use client";

import { useState, useEffect, useCallback } from 'react';
import styles from './page.module.css';
import AddIndividualForm from './components/AddIndividualForm';
import InsertForm from './components/InsertForm';
import UpdateForm from './components/UpdateForm';

export default function Home() {
  const [activeMode, setActiveMode] = useState('insert');
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [tableData, setTableData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- THIS FUNCTION IS NOW COMPLETE ---
  const fetchTableData = useCallback(async () => {
    if (!selectedTable) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/data?table=${selectedTable}`);
      if (!res.ok) throw new Error(`Failed to fetch data for ${selectedTable}`);
      const data = await res.json();
      setTableData(data);
      if (data.length > 0) {
        setColumns(Object.keys(data[0]));
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
  }, [selectedTable]);

  // --- THIS USEEFFECT IS NOW COMPLETE ---
  useEffect(() => {
    async function fetchTables() {
      try {
        const res = await fetch('/api/tables');
        const data = await res.json();
        setTables(data);
        if (data.length > 0) {
          setSelectedTable(data[0]);
        }
      } catch (err) {
        setError('Failed to fetch table list.');
      }
    }
    fetchTables();
  }, []);

  // --- THIS USEEFFECT IS NOW COMPLETE ---
  useEffect(() => {
    fetchTableData();
  }, [fetchTableData]);
  
  return (
    <main>
      <h1 style={{ textAlign: 'center', color: '#343a40', marginBottom: '2rem' }}>
        DNA DATABASE INDIA
      </h1>

      <div style={{ margin: '20px 0', display: 'flex', gap: '10px' }}>
        <button onClick={() => setActiveMode('insert')} disabled={activeMode === 'insert'}>Insert Record</button>
        <button onClick={() => setActiveMode('addIndividual')} disabled={activeMode === 'addIndividual'}>Add New Individual</button>
        <button onClick={() => setActiveMode('update')} disabled={activeMode === 'update'}>Update Professional Details</button>
      </div>

      {activeMode === 'addIndividual' && <AddIndividualForm onIndividualAdded={() => setActiveMode('insert')} />}
      {activeMode === 'update' && <UpdateForm onUpdateSuccess={(tableName) => { setSelectedTable(tableName); }} />}
      {activeMode === 'insert' && (
        <>
          <div style={{ margin: '20px 0' }}>
            <label htmlFor="table-select" style={{ marginRight: '10px', fontWeight: '500' }}>Select a Table to View/Insert:</label>
            <select id="table-select" value={selectedTable || ''} onChange={(e) => setSelectedTable(e.target.value)}>
              {tables.filter(Boolean).map(table => (<option key={table} value={table}>{table}</option>))}
            </select>
          </div>
          {selectedTable && columns.length > 0 && (
            <InsertForm columns={columns} selectedTable={selectedTable} onInsertSuccess={fetchTableData} />
          )}
        </>
      )}

      <hr style={{ margin: '40px 0', border: 'none', borderTop: '1px solid #dee2e6' }} />

      <h2>Viewing Table: `{selectedTable}`</h2>
      {loading && <p>Loading data...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
      {!loading && !error && tableData.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                {columns.map(col => <th key={col}>{col}</th>)}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map(col => (
                    <td key={col}>
                      {(row[col] && typeof row[col] === 'string' && col.toLowerCase().includes('date'))
                        ? row[col].slice(0, 10)
                        : String(row[col] === null ? '' : row[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {!loading && !error && tableData.length === 0 && selectedTable && (
        <p>No data found in table: {selectedTable}</p>
      )}
    </main>
  );
}