// File: src/app/components/AddIndividualForm.js
"use client";

import { useState } from 'react';
import styles from '../page.module.css';

export default function AddIndividualForm({ onIndividualAdded }) {
  const [formData, setFormData] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/data?table=individual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to insert data');
      }
      alert('New individual added successfully!');
      onIndividualAdded(); // This tells the main page to refresh its data
      setFormData({}); // Clear the form
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h3>Add New Individual</h3>
      {['First_Name', 'Last_Name', 'Date_Of_Birth', 'Gender'].map(col => (
        <div key={col} className={styles.formGroup}>
          <label htmlFor={col}>{col}:</label>
          <input
            type={col.includes('Date') ? 'date' : 'text'}
            id={col}
            name={col}
            value={formData[col] || ''}
            onChange={handleInputChange}
            required
          />
        </div>
      ))}
      <button type="submit">Create Individual</button>
    </form>
  );
}