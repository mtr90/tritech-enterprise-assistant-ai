'use client';

import { useState, useRef, useEffect } from 'react';

export default function TriTechAssistant() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Welcome to TriTech Enterprise Assistant\n\nI\'m your intelligent assistant for the Premium Pro Enterprise workbook with hybrid AI capabilities. I can handle both simple queries locally and complex analysis using advanced AI.\n\nSelect a product below or ask me anything about TriTech Enterprise!',
      source: 'system',
      confidence: 'high'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forceMode, setForceMode] = useState('auto'); // 'auto', 'local', 'ai'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking');
  const messagesEndRef = useRef(null);

  const products = {
    'Premium': {
      icon: '💰',
      title: 'Premium Tax',
      description: 'Annual & estimate returns',
      questions: [
        'List all Premium Tax features',
        'How do retaliatory tax calculations work?',
        'What states support electronic filing?',
        'Explain Premium Tax annual return process',
        'How to set up multi-state filing?'
      ]
    },
    'Municipal': {
      icon: '🏛️',
      title: 'Municipal',
      description: 'Local premium tax filings',
      questions: [
        'How does Municipal rollover work?',
        'What are Municipal Tax key features?',
        'Explain entity management in Municipal',
        'How to update tax rates in Municipal?',
        'Municipal data preservation process'
      ]
    },
    'FormsPlus': {
      icon: '📋',
      title: 'FormsPlus',
      description: '1000+ state forms and filings',
      questions: [
        'List all FormsPlus capabilities',
        'How does FormsPlus integrate with Premium Tax?',
        'What forms are supported in FormsPlus?',
        'FormsPlus electronic filing options',
        'How to manage form templates?'
      ]
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setApiStatus(data.services.claude_api === 'configured' ? 'ready' : 'local');
    } catch (error) {
      setApiStatus('local');
    }
  };

  const handleSubmit = async (e, questionText = null) => {
    e?.preventDefault();
    const messageText = questionText || input.trim();
    if (!messageText || isLoading) return;

    const userMessage = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: messageText,
          forceMode: forceMode 
        })
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      const assistantMessage = {
        role: 'assistant',
        content: data.response,
        source: data.source,
        confidence: data.confidence,
        relatedTopics: data.relatedTopics
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        source: 'error',
        confidence: 'low'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatMessage = (content) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <div key={index} style={{ fontWeight: 'bold', color: '#3b82f6', marginTop: '12px', marginBottom: '8px' }}>{line.slice(2, -2)}</div>;
      }
      if (line.startsWith('• ')) {
        return <div key={index} style={{ marginLeft: '16px', marginBottom: '4px' }}>• {line.slice(2)}</div>;
      }
      if (line.trim() === '') {
        return <div key={index} style={{ height: '8px' }}></div>;
      }
      return <div key={index} style={{ marginBottom: '4px' }}>{line}</div>;
    });
  };

  const getSourceBadge = (source) => {
    if (source === 'ai') {
      return <span style={{ 
        backgroundColor: '#10b981', 
        color: 'white', 
        padding: '2px 8px', 
        borderRadius: '12px', 
        fontSize: '12px', 
        fontWeight: '500' 
      }}>🧠 AI Enhanced</span>;
    }
    if (source === 'local') {
      return <span style={{ 
        backgroundColor: '#3b82f6', 
        color: 'white', 
        padding: '2px 8px', 
        borderRadius: '12px', 
        fontSize: '12px', 
        fontWeight: '500' 
      }}>⚡ Fast Local</span>;
    }
    return null;
  };

  const getModeToggleStyle = (mode) => ({
    padding: '6px 12px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    backgroundColor: forceMode === mode ? '#3b82f6' : '#374151',
    color: 'white',
    transition: 'all 0.2s ease'
  });

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0f172a', 
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{ 
        textAlign: 'center',
        marginBottom: '32px'
      }}>
        <h1 style={{ 
          margin: '0 0 8px 0', 
          fontSize: '32px', 
          fontWeight: '700',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          🔧 TriTech Enterprise Assistant
        </h1>
        <p style={{ 
          fontSize: '16px', 
          color: '#94a3b8', 
          margin: '0 0 16px 0' 
        }}>
          AI-Powered Analysis for All TriTech Products
        </p>
        <p style={{ 
          fontSize: '14px', 
          color: '#64748b', 
          margin: '0' 
        }}>
          Enterprise-Grade Pattern Matching • 500+ Historical Patterns • Instant Solutions
        </p>
        
        {/* Status Badge */}
        <div style={{ 
          display: 'inline-flex',
          alignItems: 'center',
          padding: '8px 16px', 
          backgroundColor: apiStatus === 'ready' ? '#10b981' : '#d97706', 
          borderRadius: '20px', 
          fontSize: '12px', 
          fontWeight: '500',
          marginTop: '16px'
        }}>
          {apiStatus === 'ready' ? '✅ Hybrid AI Ready' : '⚡ Local Mode Only'}
        </div>
      </div>

      {/* Main Container */}
      <div style={{ 
        maxWidth: '1000px', 
        margin: '0 auto',
        backgroundColor: '#1e293b',
        borderRadius: '16px',
        border: '1px solid #334155',
        overflow: 'hidden'
      }}>
        
        {/* Product Selection */}
        {messages.length <= 1 && (
          <div style={{ padding: '32px' }}>
            <div style={{ 
              borderLeft: '4px solid #3b82f6',
              paddingLeft: '16px',
              marginBottom: '24px'
            }}>
              <h3 style={{ 
                margin: '0 0 8px 0', 
                fontSize: '18px', 
                fontWeight: '600',
                color: '#f1f5f9'
              }}>
                Select Your TriTech Product
              </h3>
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '16px',
              marginBottom: '32px'
            }}>
              {Object.entries(products).map(([key, product]) => (
                <div
                  key={key}
                  onClick={() => setSelectedProduct(key)}
                  style={{
                    padding: '20px',
                    backgroundColor: selectedProduct === key ? '#374151' : '#2d3748',
                    border: selectedProduct === key ? '2px solid #3b82f6' : '1px solid #4a5568',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedProduct !== key) {
                      e.target.style.backgroundColor = '#374151';
                      e.target.style.borderColor = '#3b82f6';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedProduct !== key) {
                      e.target.style.backgroundColor = '#2d3748';
                      e.target.style.borderColor = '#4a5568';
                    }
                  }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>{product.icon}</div>
                  <h4 style={{ 
                    margin: '0 0 8px 0', 
                    fontSize: '16px', 
                    fontWeight: '600',
                    color: '#f1f5f9'
                  }}>
                    {product.title}
                  </h4>
                  <p style={{ 
                    margin: '0', 
                    fontSize: '14px', 
                    color: '#94a3b8' 
                  }}>
                    {product.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Sample Questions */}
            {selectedProduct && (
              <div style={{ 
                borderLeft: '4px solid #ef4444',
                paddingLeft: '16px',
                marginBottom: '24px'
              }}>
                <h3 style={{ 
                  margin: '0 0 16px 0', 
                  fontSize: '16px', 
                  fontWeight: '600',
                  color: '#ef4444'
                }}>
                  🔥 Most Frequent Questions (Click to Auto-Fill)
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {products[selectedProduct].questions.map((question, index) => (
                    <div
                      key={index}
                      onClick={(e) => handleSubmit(e, question)}
                      style={{
                        padding: '12px 16px',
                        backgroundColor: '#374151',
                        border: '1px solid #4a5568',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: '#e2e8f0',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#4a5568';
                        e.target.style.borderColor = '#3b82f6';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#374151';
                        e.target.style.borderColor = '#4a5568';
                      }}
                    >
                      <strong style={{ color: '#f1f5f9' }}>{question.split(':')[0]}:</strong> {question.includes(':') ? question.split(':').slice(1).join(':') : question}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mode Toggle */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '16px',
              marginTop: '24px'
            }}>
              <span style={{ fontSize: '14px', color: '#94a3b8' }}>Response Mode:</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button 
                  onClick={() => setForceMode('local')}
                  style={getModeToggleStyle('local')}
                >
                  Local
                </button>
                <button 
                  onClick={() => setForceMode('ai')}
                  style={getModeToggleStyle('ai')}
                >
                  AI
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div style={{ 
          maxHeight: messages.length > 1 ? '500px' : 'auto',
          overflow: 'auto', 
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {messages.map((message, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
              width: '100%'
            }}>
              <div style={{ 
                maxWidth: '80%',
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: message.role === 'user' ? '#3b82f6' : '#374151',
                border: message.role === 'assistant' ? '1px solid #4a5568' : 'none'
              }}>
                {message.role === 'assistant' && message.source !== 'system' && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    marginBottom: '8px',
                    fontSize: '12px',
                    color: '#94a3b8'
                  }}>
                    🤖 Assistant
                    {getSourceBadge(message.source)}
                  </div>
                )}
                <div style={{ 
                  fontSize: '14px', 
                  lineHeight: '1.5',
                  color: message.role === 'user' ? 'white' : '#e2e8f0'
                }}>
                  {formatMessage(message.content)}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{ 
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: '#374151',
                border: '1px solid #4a5568'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    backgroundColor: '#3b82f6',
                    animation: 'pulse 1.5s ease-in-out infinite'
                  }}></div>
                  <div style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    backgroundColor: '#3b82f6',
                    animation: 'pulse 1.5s ease-in-out infinite 0.2s'
                  }}></div>
                  <div style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    backgroundColor: '#3b82f6',
                    animation: 'pulse 1.5s ease-in-out infinite 0.4s'
                  }}></div>
                  <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '8px' }}>
                    {forceMode === 'ai' ? 'AI thinking...' : forceMode === 'local' ? 'Searching locally...' : 'Processing...'}
                  </span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ 
          padding: '24px',
          borderTop: '1px solid #334155'
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px' }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Ask me anything about TriTech Enterprise..."
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid #4a5568',
                backgroundColor: '#374151',
                color: 'white',
                fontSize: '14px',
                resize: 'none',
                minHeight: '48px',
                maxHeight: '120px',
                outline: 'none'
              }}
              rows={1}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: isLoading || !input.trim() ? '#4a5568' : '#3b82f6',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Send
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
