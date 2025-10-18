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

  // --- State for the search functionality ---
  const [searchColumn, setSearchColumn] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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
        const tableColumns = Object.keys(data[0]);
        setColumns(tableColumns);
        setSearchColumn(tableColumns[0]); // Default search to the first column
      } else {
        setColumns([]);
      }
      setSearchQuery(''); // Reset search when table changes
    } catch (err) {
      setError(err.message);
      setTableData([]);
      setColumns([]);
    } finally {
      setLoading(false);
    }
  }, [selectedTable]);

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

  useEffect(() => {
    fetchTableData();
  }, [fetchTableData]);

  const handleDelete = async (id, primaryKeyColumn) => {
    if (!window.confirm(`Are you sure you want to delete this record with ID ${id}?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/data?table=${selectedTable}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, primaryKeyColumn }),
      });
      if (!res.ok) {
        throw new Error((await res.json()).message || 'Failed to delete record');
      }
      alert('Record deleted successfully!');
      fetchTableData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleUpdate = async (rowData) => {
    const primaryKeyColumn = columns[0];
    const id = rowData[primaryKeyColumn];
    
    const updateData = {};
    for (const col of columns) {
      if (col === primaryKeyColumn) continue;
      
      const newValue = window.prompt(`Enter new value for ${col}:`, rowData[col]);
      if (newValue === null) return;
      
      updateData[col] = newValue;
    }

    try {
      const res = await fetch(`/api/data?table=${selectedTable}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, primaryKeyColumn, updateData }),
      });
      if (!res.ok) {
        throw new Error((await res.json()).message || 'Failed to update record');
      }
      alert('Record updated successfully!');
      fetchTableData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // --- Filtering logic ---
  const filteredData = tableData.filter(row => {
    if (!searchQuery || !searchColumn) {
      return true;
    }
    const cellValue = String(row[searchColumn] || '').toLowerCase();
    return cellValue.includes(searchQuery.toLowerCase());
  });
  
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

      <div style={{ display: 'flex', gap: '10px', margin: '20px 0', alignItems: 'center' }}>
        <select 
          value={searchColumn} 
          onChange={(e) => setSearchColumn(e.target.value)}
          aria-label="Select column to search"
        >
          {columns.map(col => <option key={col} value={col}>Search by {col}</option>)}
        </select>
        <input 
          type="text" 
          placeholder="Type to search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: '8px', width: '300px' }}
        />
      </div>

      {loading && <p>Loading data...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
      {!loading && !error && tableData.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                {columns.map(col => <th key={col}>{col}</th>)}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map(col => (
                    <td key={col}>
                      {(row[col] && typeof row[col] === 'string' && col.toLowerCase().includes('date'))
                        ? row[col].slice(0, 10)
                        : String(row[col] === null ? '' : row[col])}
                    </td>
                  ))}
                  <td>
                    <button onClick={() => handleUpdate(row)} style={{ marginRight: '5px' }}>Update</button>
                    <button onClick={() => handleDelete(row[columns[0]], columns[0])}>Delete</button>
                  </td>
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