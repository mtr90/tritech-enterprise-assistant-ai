'use client';

import { useState, useEffect, useRef } from 'react';

export default function TriTechAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

  const formatResponse = (text) => {
    // Convert markdown-style formatting to HTML
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/•/g, '•')
      .split('\n')
      .map(line => {
        if (line.trim().startsWith('•')) {
          return `<div style="margin: 0.25rem 0; padding-left: 1rem;">${line.trim()}</div>`;
        }
        if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
          return `<div style="font-weight: bold; margin: 1rem 0 0.5rem 0; color: #60a5fa;">${line.replace(/\*\*/g, '')}</div>`;
        }
        if (line.trim() === '') {
          return '<div style="height: 0.5rem;"></div>';
        }
        return `<div style="margin: 0.25rem 0;">${line}</div>`;
      })
      .join('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input.trim() }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage = {
        role: 'assistant',
        content: data.response,
        source: data.source || 'local',
        confidence: data.confidence || 'medium',
        relatedTopics: data.relatedTopics || []
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        source: 'error',
        confidence: 'low'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    "List all Premium Tax features",
    "How does Municipal rollover work?",
    "List all FormsPlus capabilities"
  ];

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      color: '#f1f5f9',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    header: {
      backgroundColor: '#1e293b',
      borderBottom: '1px solid #334155',
      padding: '1.5rem 1rem',
      textAlign: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 10
    },
    title: {
      fontSize: '1.75rem',
      fontWeight: '700',
      margin: '0 0 0.5rem 0',
      background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    subtitle: {
      fontSize: '0.875rem',
      color: '#94a3b8',
      margin: '0 0 0.75rem 0'
    },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.375rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '600',
      backgroundColor: apiStatus === 'ready' ? '#059669' : '#d97706',
      color: 'white',
      gap: '0.375rem'
    },
    main: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '1rem',
      height: 'calc(100vh - 120px)',
      display: 'flex',
      flexDirection: 'column'
    },
    chatContainer: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#1e293b',
      borderRadius: '1rem',
      border: '1px solid #334155',
      overflow: 'hidden'
    },
    messagesContainer: {
      flex: 1,
      overflowY: 'auto',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    },
    message: {
      maxWidth: '85%',
      padding: '0.875rem 1.125rem',
      borderRadius: '1rem',
      fontSize: '0.875rem',
      lineHeight: '1.5'
    },
    userMessage: {
      backgroundColor: '#3b82f6',
      color: 'white',
      alignSelf: 'flex-end',
      borderBottomRightRadius: '0.375rem'
    },
    assistantMessage: {
      backgroundColor: '#374151',
      color: '#f9fafb',
      alignSelf: 'flex-start',
      borderBottomLeftRadius: '0.375rem',
      border: '1px solid #4b5563'
    },
    messageHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '0.5rem',
      fontSize: '0.75rem',
      fontWeight: '600',
      opacity: 0.8
    },
    sourceBadge: {
      padding: '0.125rem 0.375rem',
      borderRadius: '0.375rem',
      fontSize: '0.625rem',
      fontWeight: '500'
    },
    aiSource: {
      backgroundColor: '#7c3aed',
      color: 'white'
    },
    localSource: {
      backgroundColor: '#059669',
      color: 'white'
    },
    inputContainer: {
      padding: '1rem',
      borderTop: '1px solid #334155',
      backgroundColor: '#1e293b'
    },
    quickActions: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '1rem',
      flexWrap: 'wrap'
    },
    quickButton: {
      backgroundColor: '#374151',
      color: '#d1d5db',
      border: '1px solid #4b5563',
      padding: '0.5rem 0.75rem',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontSize: '0.75rem',
      transition: 'all 0.2s',
      whiteSpace: 'nowrap'
    },
    form: {
      display: 'flex',
      gap: '0.75rem',
      alignItems: 'flex-end'
    },
    inputWrapper: {
      flex: 1,
      position: 'relative'
    },
    input: {
      width: '100%',
      backgroundColor: '#374151',
      border: '1px solid #4b5563',
      color: '#f9fafb',
      padding: '0.875rem 1rem',
      borderRadius: '0.75rem',
      fontSize: '0.875rem',
      outline: 'none',
      resize: 'none',
      minHeight: '44px',
      maxHeight: '120px'
    },
    button: {
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      padding: '0.875rem 1.5rem',
      borderRadius: '0.75rem',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '600',
      transition: 'all 0.2s',
      minHeight: '44px'
    },
    loadingDots: {
      display: 'flex',
      gap: '0.25rem',
      alignItems: 'center'
    },
    dot: {
      width: '0.375rem',
      height: '0.375rem',
      backgroundColor: '#60a5fa',
      borderRadius: '50%',
      animation: 'pulse 1.5s ease-in-out infinite'
    }
  };

  return (
    <div style={styles.container}>
      <style jsx>{`
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.3; }
          40% { opacity: 1; }
        }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }
      `}</style>
      
      <header style={styles.header}>
        <h1 style={styles.title}>TriTech Enterprise Assistant</h1>
        <p style={styles.subtitle}>🤖 AI Enhanced Intelligence</p>
        <div style={styles.badge}>
          <span>{apiStatus === 'ready' ? '✅' : '⚡'}</span>
          {apiStatus === 'ready' ? 'Hybrid AI Ready' : 'Local Mode Only'}
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.chatContainer}>
          <div style={styles.messagesContainer}>
            {messages.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                color: '#64748b',
                fontSize: '0.875rem'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💬</div>
                <div>Welcome! Ask me anything about TriTech Premium Pro Enterprise.</div>
              </div>
            )}
            
            {messages.map((message, index) => (
              <div
                key={index}
                style={{
                  ...styles.message,
                  ...(message.role === 'user' ? styles.userMessage : styles.assistantMessage)
                }}
              >
                {message.role === 'assistant' && (
                  <div style={styles.messageHeader}>
                    <span>🤖 Assistant</span>
                    {message.source && (
                      <span style={{
                        ...styles.sourceBadge,
                        ...(message.source === 'ai' ? styles.aiSource : styles.localSource)
                      }}>
                        {message.source === 'ai' ? '🧠 AI Enhanced' : '⚡ Fast Local'}
                      </span>
                    )}
                  </div>
                )}
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: message.role === 'assistant' 
                      ? formatResponse(message.content)
                      : message.content
                  }}
                />
              </div>
            ))}
            
            {isLoading && (
              <div style={{ ...styles.message, ...styles.assistantMessage }}>
                <div style={styles.messageHeader}>
                  <span>🤖 Assistant</span>
                </div>
                <div style={styles.loadingDots}>
                  <span>Thinking</span>
                  <div style={styles.dot}></div>
                  <div style={styles.dot}></div>
                  <div style={styles.dot}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={styles.inputContainer}>
            {messages.length === 0 && (
              <div style={styles.quickActions}>
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    style={styles.quickButton}
                    onClick={() => setInput(action)}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = '#4b5563';
                      e.target.style.borderColor = '#6b7280';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = '#374151';
                      e.target.style.borderColor = '#4b5563';
                    }}
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}
            
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.inputWrapper}>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything about Premium Pro Enterprise..."
                  style={styles.input}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#4b5563'}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  rows={1}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                style={{
                  ...styles.button,
                  opacity: isLoading || !input.trim() ? 0.5 : 1,
                  cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer'
                }}
                onMouseOver={(e) => {
                  if (!isLoading && input.trim()) {
                    e.target.style.backgroundColor = '#2563eb';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isLoading && input.trim()) {
                    e.target.style.backgroundColor = '#3b82f6';
                  }
                }}
              >
                {isLoading ? '...' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
