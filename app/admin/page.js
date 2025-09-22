'use client';

import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [knowledgeEntries, setKnowledgeEntries] = useState([]);
  const [csvFile, setCsvFile] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState('Premium');
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);

  const ADMIN_PASSWORD = 'tritech2024'; // Simple password protection

  // Theme colors
  const theme = {
    dark: {
      bg: '#0f172a',
      cardBg: '#1e293b',
      border: '#334155',
      text: 'white',
      textSecondary: '#94a3b8',
      textMuted: '#64748b',
      buttonBg: '#374151',
      buttonHover: '#4a5568',
      inputBg: '#374151',
      inputBorder: '#4a5568'
    },
    light: {
      bg: '#f8fafc',
      cardBg: 'white',
      border: '#e2e8f0',
      text: '#1e293b',
      textSecondary: '#475569',
      textMuted: '#64748b',
      buttonBg: '#f1f5f9',
      buttonHover: '#e2e8f0',
      inputBg: 'white',
      inputBorder: '#d1d5db'
    }
  };

  const currentTheme = isDarkMode ? theme.dark : theme.light;

  useEffect(() => {
    if (isAuthenticated) {
      loadKnowledgeEntries();
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setMessage('');
    } else {
      setMessage('Invalid password');
    }
  };

  const loadKnowledgeEntries = async () => {
    try {
      const response = await fetch('/api/admin/knowledge');
      const data = await response.json();
      setKnowledgeEntries(data.entries || []);
    } catch (error) {
      console.error('Error loading knowledge entries:', error);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      setMessage('');
    } else {
      setMessage('Please select a valid CSV file');
    }
  };

  const uploadCsv = async () => {
    if (!csvFile) {
      setMessage('Please select a CSV file first');
      return;
    }

    setIsUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('csv', csvFile);
      formData.append('product', selectedProduct);

      const response = await fetch('/api/admin/upload-csv', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage(`✅ Successfully uploaded ${data.count} entries`);
        setCsvFile(null);
        loadKnowledgeEntries();
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const deleteEntry = async (id) => {
    try {
      const response = await fetch(`/api/admin/knowledge/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessage('✅ Entry deleted successfully');
        loadKnowledgeEntries();
      } else {
        setMessage('❌ Failed to delete entry');
      }
    } catch (error) {
      setMessage(`❌ Delete failed: ${error.message}`);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `question,answer,keywords
"How to calculate retaliatory tax?","Step 1: Determine base premium amount...","retaliatory tax calculation premium"
"What is the rollover process?","The rollover process transfers prior year data...","rollover municipal transfer data"
"How to submit forms electronically?","Electronic submission requires...","electronic filing forms submit"`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'knowledge_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isAuthenticated) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: currentTheme.bg, 
        color: currentTheme.text,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{ 
          backgroundColor: currentTheme.cardBg,
          padding: '40px',
          borderRadius: '12px',
          border: `1px solid ${currentTheme.border}`,
          width: '400px'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <h1 style={{ 
              margin: '0', 
              fontSize: '24px', 
              fontWeight: '700',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              🔧 Admin Dashboard
            </h1>
            
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                border: `1px solid ${currentTheme.border}`,
                backgroundColor: currentTheme.buttonBg,
                color: currentTheme.text,
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
          
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '14px', 
                fontWeight: '500' 
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${currentTheme.inputBorder}`,
                  backgroundColor: currentTheme.inputBg,
                  color: currentTheme.text,
                  fontSize: '14px',
                  outline: 'none'
                }}
                placeholder="Enter admin password"
              />
            </div>
            
            {message && (
              <div style={{ 
                color: '#ef4444', 
                fontSize: '14px', 
                marginBottom: '16px' 
              }}>
                {message}
              </div>
            )}
            
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#3b82f6',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: currentTheme.bg, 
      color: currentTheme.text,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '32px'
        }}>
          <h1 style={{ 
            margin: '0', 
            fontSize: '28px', 
            fontWeight: '700',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            🔧 Knowledge Base Admin
          </h1>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: `1px solid ${currentTheme.border}`,
                backgroundColor: currentTheme.buttonBg,
                color: currentTheme.text,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              {isDarkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
            
            <button
              onClick={() => setIsAuthenticated(false)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: `1px solid ${currentTheme.border}`,
                backgroundColor: currentTheme.buttonBg,
                color: currentTheme.text,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Upload Section */}
        <div style={{ 
          backgroundColor: currentTheme.cardBg,
          borderRadius: '12px',
          border: `1px solid ${currentTheme.border}`,
          padding: '24px',
          marginBottom: '32px'
        }}>
          <h2 style={{ 
            margin: '0 0 20px 0', 
            fontSize: '20px', 
            fontWeight: '600' 
          }}>
            📊 Upload Knowledge CSV
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '20px',
            marginBottom: '20px'
          }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '14px', 
                fontWeight: '500' 
              }}>
                Product Category
              </label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${currentTheme.inputBorder}`,
                  backgroundColor: currentTheme.inputBg,
                  color: currentTheme.text,
                  fontSize: '14px',
                  outline: 'none'
                }}
              >
                <option value="Premium">Premium Tax</option>
                <option value="Municipal">Municipal</option>
                <option value="FormsPlus">FormsPlus</option>
              </select>
            </div>
            
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '14px', 
                fontWeight: '500' 
              }}>
                CSV File
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${currentTheme.inputBorder}`,
                  backgroundColor: currentTheme.inputBg,
                  color: currentTheme.text,
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <button
              onClick={uploadCsv}
              disabled={!csvFile || isUploading}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: !csvFile || isUploading ? currentTheme.textMuted : '#10b981',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: !csvFile || isUploading ? 'not-allowed' : 'pointer'
              }}
            >
              {isUploading ? 'Uploading...' : 'Upload CSV'}
            </button>
            
            <button
              onClick={downloadTemplate}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: '1px solid #3b82f6',
                backgroundColor: 'transparent',
                color: '#3b82f6',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              📥 Download Template
            </button>
          </div>
          
          {message && (
            <div style={{ 
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: message.includes('✅') ? '#065f46' : '#7f1d1d',
              border: `1px solid ${message.includes('✅') ? '#10b981' : '#ef4444'}`,
              fontSize: '14px',
              color: 'white'
            }}>
              {message}
            </div>
          )}
          
          <div style={{ 
            fontSize: '12px', 
            color: currentTheme.textSecondary,
            marginTop: '12px'
          }}>
            <strong>CSV Format:</strong> question, answer, keywords (one per line)
          </div>
        </div>

        {/* Knowledge Entries Table */}
        <div style={{ 
          backgroundColor: currentTheme.cardBg,
          borderRadius: '12px',
          border: `1px solid ${currentTheme.border}`,
          padding: '24px'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h2 style={{ 
              margin: '0', 
              fontSize: '20px', 
              fontWeight: '600' 
            }}>
              📚 Knowledge Entries ({knowledgeEntries.length})
            </h2>
            
            <button
              onClick={loadKnowledgeEntries}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #3b82f6',
                backgroundColor: 'transparent',
                color: '#3b82f6',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              🔄 Refresh
            </button>
          </div>
          
          {knowledgeEntries.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              color: currentTheme.textSecondary, 
              padding: '40px' 
            }}>
              No knowledge entries found. Upload a CSV file to get started.
            </div>
          ) : (
            <div style={{ 
              overflowX: 'auto',
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '8px'
            }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse' 
              }}>
                <thead>
                  <tr style={{ backgroundColor: currentTheme.buttonBg }}>
                    <th style={{ 
                      padding: '12px', 
                      textAlign: 'left', 
                      fontSize: '14px', 
                      fontWeight: '600',
                      borderBottom: `1px solid ${currentTheme.border}`,
                      color: currentTheme.text
                    }}>
                      Product
                    </th>
                    <th style={{ 
                      padding: '12px', 
                      textAlign: 'left', 
                      fontSize: '14px', 
                      fontWeight: '600',
                      borderBottom: `1px solid ${currentTheme.border}`,
                      color: currentTheme.text
                    }}>
                      Question
                    </th>
                    <th style={{ 
                      padding: '12px', 
                      textAlign: 'left', 
                      fontSize: '14px', 
                      fontWeight: '600',
                      borderBottom: `1px solid ${currentTheme.border}`,
                      color: currentTheme.text
                    }}>
                      Answer Preview
                    </th>
                    <th style={{ 
                      padding: '12px', 
                      textAlign: 'left', 
                      fontSize: '14px', 
                      fontWeight: '600',
                      borderBottom: `1px solid ${currentTheme.border}`,
                      color: currentTheme.text
                    }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {knowledgeEntries.map((entry, index) => (
                    <tr key={entry.id} style={{ 
                      backgroundColor: index % 2 === 0 ? currentTheme.cardBg : currentTheme.buttonBg 
                    }}>
                      <td style={{ 
                        padding: '12px', 
                        fontSize: '14px',
                        borderBottom: `1px solid ${currentTheme.border}`
                      }}>
                        <span style={{ 
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '12px'
                        }}>
                          {entry.product}
                        </span>
                      </td>
                      <td style={{ 
                        padding: '12px', 
                        fontSize: '14px',
                        borderBottom: `1px solid ${currentTheme.border}`,
                        maxWidth: '300px',
                        color: currentTheme.text
                      }}>
                        {entry.question}
                      </td>
                      <td style={{ 
                        padding: '12px', 
                        fontSize: '14px',
                        borderBottom: `1px solid ${currentTheme.border}`,
                        maxWidth: '400px',
                        color: currentTheme.textSecondary
                      }}>
                        {entry.answer.substring(0, 100)}...
                      </td>
                      <td style={{ 
                        padding: '12px', 
                        fontSize: '14px',
                        borderBottom: `1px solid ${currentTheme.border}`
                      }}>
                        <button
                          onClick={() => deleteEntry(entry.id)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
