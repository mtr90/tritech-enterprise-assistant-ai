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
    "Compare Premium Tax vs Municipal features",
    "Explain data flow between all products",
    "How to set up retaliatory calculations",
    "List all FormsPlus capabilities",
    "Kentucky quarterly filing process"
  ];

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#1a202c',
      color: '#f7fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    header: {
      backgroundColor: '#2d3748',
      borderBottom: '1px solid #4a5568',
      padding: '1rem',
      textAlign: 'center'
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      margin: '0 0 0.5rem 0'
    },
    subtitle: {
      fontSize: '1rem',
      color: '#a0aec0',
      margin: '0 0 0.5rem 0'
    },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.25rem 0.5rem',
      borderRadius: '0.25rem',
      fontSize: '0.75rem',
      fontWeight: '500',
      backgroundColor: apiStatus === 'ready' ? '#48bb78' : '#ed8936',
      color: 'white',
      margin: '0.5rem 0'
    },
    main: {
      maxWidth: '4xl',
      margin: '0 auto',
      padding: '1rem'
    },
    welcome: {
      backgroundColor: '#2d3748',
      border: '1px solid #4a5568',
      borderRadius: '0.5rem',
      padding: '1.5rem',
      marginBottom: '1rem'
    },
    welcomeText: {
      fontSize: '1rem',
      lineHeight: '1.6',
      marginBottom: '1rem'
    },
    quickActions: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '0.5rem',
      marginTop: '1rem'
    },
    quickButton: {
      backgroundColor: '#4a5568',
      color: '#f7fafc',
      border: '1px solid #718096',
      padding: '0.5rem',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      fontSize: '0.875rem',
      textAlign: 'left',
      transition: 'all 0.2s'
    },
    messagesContainer: {
      maxHeight: '60vh',
      overflowY: 'auto',
      marginBottom: '1rem',
      padding: '0.5rem'
    },
    message: {
      marginBottom: '1rem',
      padding: '1rem',
      borderRadius: '0.5rem',
      border: '1px solid #4a5568'
    },
    userMessage: {
      backgroundColor: '#3182ce',
      marginLeft: '2rem'
    },
    assistantMessage: {
      backgroundColor: '#2d3748',
      marginRight: '2rem'
    },
    messageHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: '500'
    },
    messageContent: {
      lineHeight: '1.6'
    },
    form: {
      display: 'flex',
      gap: '0.5rem',
      marginTop: '1rem'
    },
    input: {
      flex: 1,
      backgroundColor: '#2d3748',
      border: '1px solid #4a5568',
      color: '#f7fafc',
      padding: '0.75rem',
      borderRadius: '0.375rem',
      fontSize: '1rem',
      outline: 'none'
    },
    button: {
      backgroundColor: '#3182ce',
      color: 'white',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '500',
      transition: 'all 0.2s'
    },
    separator: {
      height: '1px',
      backgroundColor: '#4a5568',
      margin: '1rem 0'
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>TriTech Enterprise Assistant</h1>
        <p style={styles.subtitle}>🤖 AI Enhanced Intelligence</p>
        <div style={styles.badge}>
          {apiStatus === 'ready' ? '✅ Hybrid AI Ready' : '⚡ Local Mode Only'}
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.welcome}>
          <p style={styles.welcomeText}>
            Welcome to TriTech Enterprise Assistant
          </p>
          <p style={styles.welcomeText}>
            I'm your intelligent assistant for the Premium Pro Enterprise workbook with hybrid AI capabilities. 
            I can handle both simple queries locally and complex analysis using advanced AI.
          </p>
          
          <div style={styles.quickActions}>
            {quickActions.map((action, index) => (
              <button
                key={index}
                style={styles.quickButton}
                onClick={() => setInput(action)}
                onMouseOver={(e) => e.target.style.backgroundColor = '#718096'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#4a5568'}
              >
                {action}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.messagesContainer}>
          {messages.map((message, index) => (
            <div
              key={index}
              style={{
                ...styles.message,
                ...(message.role === 'user' ? styles.userMessage : styles.assistantMessage)
              }}
            >
              <div style={styles.messageHeader}>
                {message.role === 'user' ? '👤 You' : '🤖 Assistant'}
                {message.source && (
                  <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem' }}>
                    {message.source === 'ai' ? '🤖 AI Enhanced' : '⚡ Fast Local'}
                  </span>
                )}
              </div>
              <div style={styles.messageContent}>{message.content}</div>
            </div>
          ))}
          {isLoading && (
            <div style={{ ...styles.message, ...styles.assistantMessage }}>
              <div style={styles.messageHeader}>🤖 Assistant</div>
              <div style={styles.messageContent}>Thinking...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about the Premium Pro Enterprise..."
            style={styles.input}
            onFocus={(e) => e.target.style.borderColor = '#3182ce'}
            onBlur={(e) => e.target.style.borderColor = '#4a5568'}
          />
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
                e.target.style.backgroundColor = '#2c5aa0';
              }
            }}
            onMouseOut={(e) => {
              if (!isLoading && input.trim()) {
                e.target.style.backgroundColor = '#3182ce';
              }
            }}
          >
            Send
          </button>
        </form>
      </main>
    </div>
  );
}
