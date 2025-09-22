'use client';

import { useState, useRef, useEffect } from 'react';

export default function TriTechAssistant() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Welcome to TriTech Enterprise Assistant\n\nI\'m your intelligent assistant for the Premium Pro Enterprise workbook with hybrid AI capabilities. I can handle both simple queries locally and complex analysis using advanced AI.\n\nSelect sample questions from the sidebar or ask me anything about TriTech products!',
      source: 'system',
      confidence: 'high'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forceMode, setForceMode] = useState('auto'); // 'auto', 'local', 'ai'
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [apiStatus, setApiStatus] = useState('checking');
  const messagesEndRef = useRef(null);

  const sampleQuestions = {
    'Premium': [
      'List all Premium Tax features',
      'How do retaliatory tax calculations work?',
      'What states support electronic filing?',
      'Explain Premium Tax annual return process',
      'How to set up multi-state filing?'
    ],
    'Municipal': [
      'How does Municipal rollover work?',
      'What are Municipal Tax key features?',
      'Explain entity management in Municipal',
      'How to update tax rates in Municipal?',
      'Municipal data preservation process'
    ],
    'FormsPlus': [
      'List all FormsPlus capabilities',
      'How does FormsPlus integrate with Premium Tax?',
      'What forms are supported in FormsPlus?',
      'FormsPlus electronic filing options',
      'How to manage form templates?'
    ],
    'Allocator': [
      'What is the Allocator module used for?',
      'How does Allocator integrate with other modules?',
      'Allocator calculation methods',
      'Setting up allocation rules',
      'Allocator reporting capabilities'
    ]
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
      display: 'flex', 
      height: '100vh', 
      backgroundColor: '#0f172a', 
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Sidebar */}
      <div style={{ 
        width: sidebarOpen ? '320px' : '0px',
        backgroundColor: '#1e293b',
        borderRight: '1px solid #334155',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #334155' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>Sample Questions</h3>
          
          {/* Mode Toggle */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', marginBottom: '8px', color: '#94a3b8' }}>Response Mode:</div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button 
                onClick={() => setForceMode('auto')}
                style={getModeToggleStyle('auto')}
              >
                Auto
              </button>
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
            <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
              {forceMode === 'auto' && 'Smart routing based on query complexity'}
              {forceMode === 'local' && 'Force local knowledge base responses'}
              {forceMode === 'ai' && 'Force AI-enhanced responses'}
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
          {Object.entries(sampleQuestions).map(([product, questions]) => (
            <div key={product} style={{ marginBottom: '24px' }}>
              <h4 style={{ 
                margin: '0 0 12px 0', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#3b82f6',
                borderBottom: '1px solid #334155',
                paddingBottom: '4px'
              }}>
                {product}
              </h4>
              {questions.map((question, index) => (
                <button
                  key={index}
                  onClick={(e) => handleSubmit(e, question)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 12px',
                    marginBottom: '6px',
                    backgroundColor: 'transparent',
                    border: '1px solid #374151',
                    borderRadius: '6px',
                    color: '#e2e8f0',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#374151';
                    e.target.style.borderColor = '#3b82f6';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.borderColor = '#374151';
                  }}
                >
                  {question}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ 
          padding: '16px 24px', 
          borderBottom: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #374151',
                borderRadius: '6px',
                color: 'white',
                padding: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {sidebarOpen ? '◀' : '▶'}
            </button>
            <div>
              <h1 style={{ 
                margin: 0, 
                fontSize: '24px', 
                fontWeight: '700',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                TriTech Enterprise Assistant
              </h1>
              <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
                🧠 AI Enhanced Intelligence • Mode: {forceMode.charAt(0).toUpperCase() + forceMode.slice(1)}
              </div>
            </div>
          </div>
          <div style={{ 
            padding: '6px 12px', 
            backgroundColor: apiStatus === 'ready' ? '#10b981' : '#d97706', 
            borderRadius: '20px', 
            fontSize: '12px', 
            fontWeight: '500' 
          }}>
            {apiStatus === 'ready' ? '✅ Hybrid AI Ready' : '⚡ Local Mode Only'}
          </div>
        </div>

        {/* Messages */}
        <div style={{ 
          flex: 1, 
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
                maxWidth: '70%',
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: message.role === 'user' ? '#3b82f6' : '#1e293b',
                border: message.role === 'assistant' ? '1px solid #334155' : 'none'
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
                backgroundColor: '#1e293b',
                border: '1px solid #334155'
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

        {/* Input */}
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
              placeholder="Ask me anything about the Premium Pro Enterprise..."
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid #374151',
                backgroundColor: '#1e293b',
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
                backgroundColor: isLoading || !input.trim() ? '#374151' : '#3b82f6',
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
