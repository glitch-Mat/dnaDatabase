// File: src/app/components/InsertForm.js
"use client";

import { useState, useEffect } from 'react';
import styles from '../page.module.css';

const getPlaceholder = (columnName) => {
    const lowerCol = columnName.toLowerCase();
    if (lowerCol.includes('date')) return 'YYYY-MM-DD';
    if (lowerCol.includes('email')) return 'example@email.com';
    return `Enter ${columnName}...`;
};

export default function InsertForm({ columns, selectedTable, onInsertSuccess }) {
    // This state will hold the clean IDs for submission to the database
    const [formData, setFormData] = useState({});
    // This state will hold the text the user sees in the input boxes
    const [displayValues, setDisplayValues] = useState({});
    
    // State for all our dropdown lists
    const [individualsList, setIndividualsList] = useState([]);
    const [professionalsList, setProfessionalsList] = useState([]);
    // ... (other list states are the same)

    // Fetch all lists when the component loads
    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const [indRes, profRes /*, ...other fetches */] = await Promise.all([
                    fetch('/api/list/individuals'),
                    fetch('/api/list/professionals'),
                    // ... other fetches
                ]);
                setIndividualsList(await indRes.json());
                setProfessionalsList(await profRes.json());
            } catch (err) {
                console.error("Failed to fetch dropdown data", err);
            }
        };
        fetchDropdownData();
    }, []);

    // Reset forms when table changes
    useEffect(() => {
        setFormData({});
        setDisplayValues({});
    }, [selectedTable]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Update the visible text in the input box
        setDisplayValues(prev => ({ ...prev, [name]: value }));

        // --- SMART ID PARSING ---
        // For our special autocomplete fields, we need to extract just the ID from the text
        if (name === 'Individual_ID' || name === 'Professional_ID') {
            // Use a regular expression to find a pattern like "(ID: 123)" at the end of the string
            const match = value.match(/\(ID: (\d+)\)$/);
            if (match) {
                // If a match is found, update our actual form data with just the number
                setFormData(prev => ({ ...prev, [name]: match[1] }));
            }
        } else {
            // For all other fields, the value is just the text
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // ... (handleSubmit logic is unchanged)
            const res = await fetch(`/api/data?table=${selectedTable}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!res.ok) throw new Error((await res.json()).message || 'Failed to insert');
            alert('Data inserted successfully!');
            onInsertSuccess();
            setFormData({});
            setDisplayValues({});
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    // --- SPECIAL UI FOR CONTACT_RECORD ---
    if (selectedTable === 'contact_record') {
        return (
            <form onSubmit={handleSubmit} className={styles.form}>
                <h3>Insert into `{selectedTable}`</h3>
                
                {/* --- NEW AUTOCOMPLETE INPUT FOR INDIVIDUAL --- */}
                <div className={styles.formGroup}>
                    <label htmlFor="Individual_ID">Select Individual (or type to search):</label>
                    <input
                        id="Individual_ID"
                        name="Individual_ID"
                        type="text"
                        list="individuals-list"
                        value={displayValues.Individual_ID || ''}
                        onChange={handleInputChange}
                        placeholder="Type a name or ID..."
                        required
                    />
                    <datalist id="individuals-list">
                        {individualsList.map(ind => <option key={ind.Individual_ID} value={`${ind.Name} (ID: ${ind.Individual_ID})`} />)}
                    </datalist>
                </div>
                
                {/* --- NEW AUTOCOMPLETE INPUT FOR PROFESSIONAL --- */}
                <div className={styles.formGroup}>
                    <label htmlFor="Professional_ID">Select Professional (or type to search):</label>
                    <input
                        id="Professional_ID"
                        name="Professional_ID"
                        type="text"
                        list="professionals-list"
                        value={displayValues.Professional_ID || ''}
                        onChange={handleInputChange}
                        placeholder="Type a name or ID..."
                        required
                    />
                    <datalist id="professionals-list">
                        {professionalsList.map(prof => <option key={prof.Professional_ID} value={`${prof.Name} (ID: ${prof.Professional_ID})`} />)}
                    </datalist>
                </div>

                {/* Other fields */}
                <div className={styles.formGroup}>
                    <label htmlFor="Contact_Type">Contact_Type:</label>
                    <input type="text" id="Contact_Type" name="Contact_Type" value={formData.Contact_Type || ''} onChange={handleInputChange} required />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="Contact_Date">Contact_Date:</label>
                    <input type="date" id="Contact_Date" name="Contact_Date" value={formData.Contact_Date || ''} onChange={handleInputChange} required />
                </div>
                <button type="submit">Insert Record</button>
            </form>
        );
    }

    // --- DEFAULT FORM for all other tables ---
    // ... (The rest of your component logic for other tables remains the same)
    // ...
}