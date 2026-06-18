import { useState } from 'react';
import api from '../services/api';

const IssuePage = () => {
  const [formData, setFormData] = useState({
    rollNumber: '',
    bookId: '',
    dueDate: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleIssueBook = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/issued-books', formData);
      alert(`Book issued successfully! ID: ${response.data.id || ''}`);
      setFormData({ rollNumber: '', bookId: '', dueDate: '' });
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to issue book');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px' }}>
      <h2>Issue a Book</h2>
      <form onSubmit={handleIssueBook} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label>Roll Number: </label>
          <input type="text" name="rollNumber" value={formData.rollNumber} onChange={handleInputChange} required />
        </div>
        <div>
          <label>Book ID: </label>
          <input type="text" name="bookId" value={formData.bookId} onChange={handleInputChange} required />
        </div>
        <div>
          <label>Due Date: </label>
          <input type="date" name="dueDate" value={formData.dueDate} onChange={handleInputChange} required />
        </div>
        <button type="submit" style={{ padding: '8px', cursor: 'pointer' }}>Issue Book</button>
      </form>
    </div>
  );
};

export default IssuePage;