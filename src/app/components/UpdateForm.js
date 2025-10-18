// File: src/app/components/UpdateForm.js
"use client";

import { useState, useEffect } from 'react';
import styles from '../page.module.css';

export default function UpdateForm({ onUpdateSuccess }) {
  const [formMode, setFormMode] = useState('analyst'); // 'analyst' or 'officer'
  const [analysts, setAnalysts] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [formData, setFormData] = useState({});

  useEffect(() => {
    // Fetch lists for the dropdowns
    const fetchData = async () => {
      const [analystRes, officerRes] = await Promise.all([
        fetch('/api/list/medical_analysts'),
        fetch('/api/list/forensic_officers')
      ]);
      setAnalysts(await analystRes.json());
      setOfficers(await officerRes.json());
    };
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tableName = formMode === 'analyst' ? 'medical_analyst' : 'forensic_officer';
    try {
      const res = await fetch(`/api/data?table=${tableName}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedId, ...formData }),
      });
      if (!res.ok) throw new Error('Failed to update data');
      alert('Update successful!');
      onUpdateSuccess(tableName); // Refresh the correct table
      setFormData({});
      setSelectedId('');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className={styles.form}>
      <h3>Update Professional Details</h3>
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => setFormMode('analyst')} disabled={formMode === 'analyst'}>Update Medical Analyst</button>
        <button onClick={() => setFormMode('officer')} disabled={formMode === 'officer'}>Update Forensic Officer</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>Select Professional to Update:</label>
          <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} required>
            <option value="" disabled>-- Select a Professional --</option>
            {(formMode === 'analyst' ? analysts : officers).map(prof => (
              <option key={prof.Professional_ID} value={prof.Professional_ID}>{prof.Name}</option>
            ))}
          </select>
        </div>

        {/* Show fields based on the selected mode */}
        {formMode === 'analyst' && (
          <div className={styles.formGroup}>
            <label htmlFor="Specialization">Specialization:</label>
            <input type="text" name="Specialization" value={formData.Specialization || ''} onChange={handleInputChange} />
          </div>
        )}
        <div className={styles.formGroup}>
          <label htmlFor="Institute">Institute:</label>
          <input type="text" name="Institute" value={formData.Institute || ''} onChange={handleInputChange} />
        </div>

        <button type="submit" disabled={!selectedId}>Update Record</button>
      </form>
    </div>
  );
}