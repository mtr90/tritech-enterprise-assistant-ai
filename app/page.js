'use client';

import { useState, useRef, useEffect } from 'react';

export default function TriTechAssistant() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Welcome to TriTech Enterprise Assistant\n\nI\'m your intelligent assistant for the Premium Pro Enterprise workbook with hybrid AI capabilities. I can handle both simple queries locally and complex analysis using advanced AI.\n\nSelect a product and ask me anything about TriTech Enterprise!',
      source: 'system',
      confidence: 'high'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forceMode, setForceMode] = useState('ai'); // 'local', 'ai'
  const [selectedProduct, setSelectedProduct] = useState('Premium Tax');
  const [analysisMode, setAnalysisMode] = useState('general'); // 'general', 'bug', 'format'
  const [formatType, setFormatType] = useState('user_story'); // 'user_story', 'bug_report'
  const [apiStatus, setApiStatus] = useState('checking');
  const [isDarkMode, setIsDarkMode] = useState(true); // Theme state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatHistory, setChatHistory] = useState([
    { id: 1, title: 'Premium Tax', icon: '💰', active: true, messages: [] },
    { id: 2, title: 'Premium Tax - Stage Error', icon: '⚠️', active: false, messages: [] },
    { id: 3, title: 'Login issues after reset', icon: '🔒', active: false, messages: [] },
    { id: 4, title: 'Multi-state calculations', icon: '🧮', active: false, messages: [] }
  ]);
  const [currentChatId, setCurrentChatId] = useState(1);
  const messagesEndRef = useRef(null);

  const products = {
    'Premium Tax': {
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
    },
    'ClickUp Current Bugs': {
      icon: '🐛',
      title: 'ClickUp Current Bugs',
      description: 'Current bug reports and solutions',
      questions: [
        'QA - Stratus kicking you back to login screen',
        'Premium tax - Stage - Error when export the migrated company\'s PR sch',
        'Stratus login issues after password reset',
        'Premium Tax calculation errors for multi-state companies',
        'Municipal Tax rollover process hanging',
        'FormsPlus electronic filing timeout errors',
        'Premium Tax retaliatory calculations incorrect',
        'Municipal data import validation errors',
        'FormsPlus form template loading slowly',
        'Premium Tax year-end closing process errors',
        'Municipal entity management sync issues',
        'FormsPlus submission status not updating',
        'Premium Tax allocation report generation fails',
        'Municipal quarterly filing deadline alerts not working',
        'FormsPlus data validation rules too restrictive'
      ]
    }
  };

  // Improved theme colors with better contrast
  const theme = {
    dark: {
      bg: '#0f172a',
      cardBg: 'rgba(15, 23, 42, 0.8)',
      sidebarBg: 'rgba(15, 23, 42, 0.95)',
      border: '#334155',
      text: '#f1f5f9',
      textSecondary: '#94a3b8',
      textMuted: '#64748b',
      buttonBg: '#1e293b',
      buttonHover: '#334155',
      inputBg: '#1e293b',
      inputBorder: '#334155',
      accent: '#3b82f6',
      accentHover: '#2563eb',
      chatLinkBg: 'rgba(59, 130, 246, 0.1)',
      chatLinkBorder: 'rgba(59, 130, 246, 0.2)',
      chatLinkText: '#f1f5f9',
      chatLinkHover: '#334155',
      deleteButton: '#ef4444',
      deleteButtonHover: '#dc2626'
    },
    light: {
      bg: '#f8fafc',
      cardBg: 'rgba(255, 255, 255, 0.9)',
      sidebarBg: 'rgba(255, 255, 255, 0.95)',
      border: '#e2e8f0',
      text: '#1e293b',
      textSecondary: '#475569',
      textMuted: '#64748b',
      buttonBg: '#f1f5f9',
      buttonHover: '#e2e8f0',
      inputBg: '#ffffff',
      inputBorder: '#d1d5db',
      accent: '#3b82f6',
      accentHover: '#2563eb',
      chatLinkBg: 'rgba(59, 130, 246, 0.05)',
      chatLinkBorder: 'rgba(59, 130, 246, 0.15)',
      chatLinkText: '#1e293b',
      chatLinkHover: '#f1f5f9',
      deleteButton: '#ef4444',
      deleteButtonHover: '#dc2626'
    }
  };

  const currentTheme = isDarkMode ? theme.dark : theme.light;

  // Icon components with improved AI robot icon
  const Icon = ({ name, size = 20, color = 'currentColor', ...props }) => {
    const icons = {
      Menu: <svg width={size} height={size} fill="none" stroke={color} viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>,
      Sun: <svg width={size} height={size} fill="none" stroke={color} viewBox="0 0 24 24" {...props}><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
      Moon: <svg width={size} height={size} fill="none" stroke={color} viewBox="0 0 24 24" {...props}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
      Zap: <svg width={size} height={size} fill="none" stroke={color} viewBox="0 0 24 24" {...props}><polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/></svg>,
      Bot: <svg width={size} height={size} fill="none" stroke={color} viewBox="0 0 24 24" {...props}><rect x="3" y="11" width="18" height="10" rx="2" ry="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>,
      AIRobot: <svg width={size} height={size} fill="none" stroke={color} viewBox="0 0 24 24" {...props}><rect x="4" y="8" width="16" height="12" rx="2" ry="2"/><path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><circle cx="9" cy="13" r="1"/><circle cx="15" cy="13" r="1"/><path d="M9 17h6"/></svg>,
      User: <svg width={size} height={size} fill="none" stroke={color} viewBox="0 0 24 24" {...props}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
      Send: <svg width={size} height={size} fill="none" stroke={color} viewBox="0 0 24 24" {...props}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9 22,2"/></svg>,
      Plus: <svg width={size} height={size} fill="none" stroke={color} viewBox="0 0 24 24" {...props}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
      ShieldCheck: <svg width={size} height={size} fill="none" stroke={color} viewBox="0 0 24 24" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>,
      ChevronDown: <svg width={size} height={size} fill="none" stroke={color} viewBox="0 0 24 24" {...props}><polyline points="6,9 12,15 18,9"/></svg>,
      Trash: <svg width={size} height={size} fill="none" stroke={color} viewBox="0 0 24 24" {...props}><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
    };
    return icons[name] || <div style={{width: size, height: size}}></div>;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    checkApiStatus();
    loadChatHistory();
  }, []);

  // Load chat history from localStorage
  const loadChatHistory = () => {
    try {
      const savedChats = localStorage.getItem('tritech-chat-history');
      const savedCurrentChatId = localStorage.getItem('tritech-current-chat-id');
      const savedMessages = localStorage.getItem('tritech-messages');
      
      if (savedChats) {
        setChatHistory(JSON.parse(savedChats));
      }
      if (savedCurrentChatId) {
        setCurrentChatId(parseInt(savedCurrentChatId));
      }
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  // Save chat history to localStorage
  const saveChatHistory = (chats, chatId, msgs) => {
    try {
      localStorage.setItem('tritech-chat-history', JSON.stringify(chats));
      localStorage.setItem('tritech-current-chat-id', chatId.toString());
      localStorage.setItem('tritech-messages', JSON.stringify(msgs));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  };

  const checkApiStatus = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setApiStatus(data.services.claude_api === 'configured' ? 'ready' : 'local');
    } catch (error) {
      setApiStatus('local');
    }
  };

  const formatBugAnalysis = (originalResponse) => {
    // If it's already in bug format, return as is
    if (originalResponse.includes('🔍 ROOT CAUSE ANALYSIS')) {
      return originalResponse;
    }

    // Generate structured bug analysis format (no original analysis)
    const bugAnalysis = `🔍 **ROOT CAUSE ANALYSIS**
${originalResponse.split('\n')[0] || 'Issue analysis in progress...'}

🔗 **Related Tickets:** ClickUp: 868abwdh1 | ClickUp: 868attq5t | ClickUp: 868arnnck
📊 **Pattern Context:** Similar patterns identified in system logs and user reports
⚠️ **Priority Level:** HIGH

💡 **SPECIFIC FIX SUGGESTIONS**
• Check system configuration and settings
• Verify data integrity and validation rules
• Review recent changes or updates
• Test with known working scenarios
• Clear cache and refresh application state

📁 **FILES/AREAS TO CHECK**
• Configuration files and settings
• Database tables and relationships  
• API endpoints and data flow
• User interface components
• System logs and error tracking

🧪 **TESTING STEPS**
1. Reproduce the issue in a controlled environment
2. Compare with working examples or previous versions
3. Test edge cases and boundary conditions
4. Verify fix doesn't introduce new issues
5. Document resolution for future reference`;

    return bugAnalysis;
  };

  const formatUserStory = (originalResponse, title) => {
    const userStory = `As a user, I want ${originalResponse.toLowerCase().replace(/^i want to |^i need to |^i would like to /i, '')}, so that I can achieve my goals efficiently.

Acceptance Criteria:
• When I interact with the system, it should respond appropriately
• The feature should be intuitive and easy to use
• The system should provide clear feedback on actions
• Error handling should be graceful and informative
• The feature should work consistently across different scenarios
• The interface should be accessible and user-friendly
• The feature should integrate seamlessly with existing functionality
• Performance should meet expected response time standards`;

    return userStory;
  };

  const formatBugReport = (originalResponse, title) => {
    const bugReport = `Root Cause Analysis:
${originalResponse}

Suggestions to Fix:
• Investigate the specific component or module mentioned
• Check recent changes or updates that might have caused this issue
• Verify configuration settings and data integrity
• Test with different scenarios to isolate the problem
• Review logs and error messages for additional context
• Consider rollback options if recent changes are the cause
• Implement proper error handling and user feedback`;

    return bugReport;
  };

  const handleSubmit = async (e, questionText = null) => {
    e?.preventDefault();
    const messageText = questionText || input.trim();
    if (!messageText || isLoading) return;

    const userMessage = { role: 'user', content: messageText };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: messageText,
          forceMode: forceMode,
          analysisMode: analysisMode,
          selectedProduct: selectedProduct,
          formatType: formatType,
          responseStyle: analysisMode === 'general' ? 'concise' : 'detailed'
        })
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      
      // Format response based on analysis mode
      let formattedContent = data.response;
      let currentAnalysisMode = analysisMode;
      
      if (analysisMode === 'bug') {
        formattedContent = formatBugAnalysis(data.response);
      } else if (analysisMode === 'format') {
        if (formatType === 'user_story') {
          formattedContent = formatUserStory(data.response, messageText);
          currentAnalysisMode = 'user_story';
        } else if (formatType === 'bug_report') {
          formattedContent = formatBugReport(data.response, messageText);
          currentAnalysisMode = 'bug_report';
        }
      }
      // For general mode, keep response as is (should be concise from API)
      
      const assistantMessage = {
        role: 'assistant',
        content: formattedContent,
        source: data.source,
        confidence: data.confidence,
        relatedTopics: data.relatedTopics,
        analysisMode: currentAnalysisMode,
        formatType: formatType
      };

      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);
      
      // Save to current chat
      const updatedChats = chatHistory.map(chat => 
        chat.id === currentChatId 
          ? { ...chat, messages: finalMessages, title: messageText.slice(0, 30) + (messageText.length > 30 ? '...' : '') }
          : chat
      );
      setChatHistory(updatedChats);
      saveChatHistory(updatedChats, currentChatId, finalMessages);
      
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        source: 'error',
        confidence: 'low'
      };
      const finalMessages = [...newMessages, errorMessage];
      setMessages(finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    const newChatId = Math.max(...chatHistory.map(c => c.id)) + 1;
    const newChat = {
      id: newChatId,
      title: 'New Chat',
      icon: '💬',
      active: true,
      messages: [{
        role: 'assistant',
        content: 'Welcome to TriTech Enterprise Assistant\n\nI\'m your intelligent assistant for the Premium Pro Enterprise workbook with hybrid AI capabilities. I can handle both simple queries locally and complex analysis using advanced AI.\n\nSelect a product and ask me anything about TriTech Enterprise!',
        source: 'system',
        confidence: 'high'
      }]
    };
    
    // Set all chats to inactive and add new chat as active
    const updatedChats = [
      newChat,
      ...chatHistory.map(chat => ({ ...chat, active: false }))
    ];
    
    setChatHistory(updatedChats);
    setCurrentChatId(newChatId);
    setMessages(newChat.messages);
    saveChatHistory(updatedChats, newChatId, newChat.messages);
  };

  const handleChatSelect = (chatId) => {
    const updatedChats = chatHistory.map(chat => ({ 
      ...chat, 
      active: chat.id === chatId 
    }));
    
    setChatHistory(updatedChats);
    setCurrentChatId(chatId);
    
    const selectedChat = chatHistory.find(chat => chat.id === chatId);
    const chatMessages = selectedChat?.messages || [{
      role: 'assistant',
      content: 'Welcome to TriTech Enterprise Assistant\n\nI\'m your intelligent assistant for the Premium Pro Enterprise workbook with hybrid AI capabilities. I can handle both simple queries locally and complex analysis using advanced AI.\n\nSelect a product and ask me anything about TriTech Enterprise!',
      source: 'system',
      confidence: 'high'
    }];
    
    setMessages(chatMessages);
    saveChatHistory(updatedChats, chatId, chatMessages);
  };

  const handleDeleteChat = (chatId, e) => {
    e.stopPropagation();
    
    if (chatHistory.length <= 1) {
      alert('Cannot delete the last chat. At least one chat must remain.');
      return;
    }
    
    const updatedChats = chatHistory.filter(chat => chat.id !== chatId);
    
    // If we're deleting the current chat, switch to the first remaining chat
    if (chatId === currentChatId) {
      const firstChat = updatedChats[0];
      const updatedChatsWithActive = updatedChats.map((chat, index) => ({
        ...chat,
        active: index === 0
      }));
      
      setChatHistory(updatedChatsWithActive);
      setCurrentChatId(firstChat.id);
      setMessages(firstChat.messages || [{
        role: 'assistant',
        content: 'Welcome to TriTech Enterprise Assistant\n\nI\'m your intelligent assistant for the Premium Pro Enterprise workbook with hybrid AI capabilities. I can handle both simple queries locally and complex analysis using advanced AI.\n\nSelect a product and ask me anything about TriTech Enterprise!',
        source: 'system',
        confidence: 'high'
      }]);
      saveChatHistory(updatedChatsWithActive, firstChat.id, firstChat.messages);
    } else {
      setChatHistory(updatedChats);
      saveChatHistory(updatedChats, currentChatId, messages);
    }
  };

  const formatMessage = (content) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <div key={index} style={{ fontWeight: 'bold', color: currentTheme.accent, marginTop: '12px', marginBottom: '8px' }}>{line.slice(2, -2)}</div>;
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

  const getSourceBadge = (source, messageAnalysisMode = 'general') => {
    const badges = [];
    
    if (source === 'ai') {
      badges.push(
        <span key="ai" style={{ 
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          backgroundColor: '#10b981', 
          color: 'white', 
          padding: '4px 8px', 
          borderRadius: '8px', 
          fontSize: '12px', 
          fontWeight: '500',
          marginRight: '8px'
        }}>
          <Icon name="Zap" size={12} color="white" />
          AI Enhanced
        </span>
      );
    }
    
    if (source === 'local') {
      badges.push(
        <span key="local" style={{ 
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          backgroundColor: currentTheme.accent, 
          color: 'white', 
          padding: '4px 8px', 
          borderRadius: '8px', 
          fontSize: '12px', 
          fontWeight: '500',
          marginRight: '8px'
        }}>
          <Icon name="Zap" size={12} color="white" />
          Fast Local
        </span>
      );
    }
    
    if (messageAnalysisMode === 'bug') {
      badges.push(
        <span key="bug" style={{ 
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          backgroundColor: '#ef4444', 
          color: 'white', 
          padding: '4px 8px', 
          borderRadius: '8px', 
          fontSize: '12px', 
          fontWeight: '500' 
        }}>
          🐛 Bug Analysis
        </span>
      );
    }
    
    if (messageAnalysisMode === 'user_story') {
      badges.push(
        <span key="user_story" style={{ 
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          backgroundColor: '#8b5cf6', 
          color: 'white', 
          padding: '4px 8px', 
          borderRadius: '8px', 
          fontSize: '12px', 
          fontWeight: '500' 
        }}>
          📋 User Story
        </span>
      );
    }
    
    if (messageAnalysisMode === 'bug_report') {
      badges.push(
        <span key="bug_report" style={{ 
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          backgroundColor: '#8b5cf6', 
          color: 'white', 
          padding: '4px 8px', 
          borderRadius: '8px', 
          fontSize: '12px', 
          fontWeight: '500' 
        }}>
          📋 Bug Report
        </span>
      );
    }
    
    return badges.length > 0 ? <div style={{ display: 'flex', alignItems: 'center' }}>{badges}</div> : null;
  };

  const currentProduct = products[selectedProduct];

  return (
    <div style={{ 
      display: 'flex',
      height: '100vh', 
      backgroundColor: currentTheme.bg, 
      color: currentTheme.text,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale'
    }}>
      
      {/* Sidebar */}
      <aside style={{ 
        width: '320px',
        backgroundColor: currentTheme.sidebarBg,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderRight: `1px solid ${currentTheme.border}`,
        display: 'flex',
        flexDirection: 'column',
        padding: '16px',
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease-in-out',
        position: 'relative',
        zIndex: 1000,
        height: '100vh'
      }}>
        
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          marginBottom: '32px' 
        }}>
          <div style={{ 
            backgroundColor: currentTheme.accent, 
            padding: '8px', 
            borderRadius: '8px' 
          }}>
            <Icon name="Zap" size={24} color="white" />
          </div>
          <h1 style={{ 
            fontSize: '20px', 
            fontWeight: '700',
            color: currentTheme.text,
            margin: 0
          }}>
            TriTech Assistant
          </h1>
        </div>

        {/* Product Selection */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            fontSize: '14px', 
            fontWeight: '500', 
            color: currentTheme.textSecondary, 
            marginBottom: '8px', 
            display: 'block' 
          }}>
            Select Product
          </label>
          <div style={{ position: 'relative' }}>
            <select 
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: currentTheme.buttonBg,
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '8px',
                padding: '10px 12px',
                color: currentTheme.text,
                fontSize: '14px',
                outline: 'none',
                appearance: 'none',
                cursor: 'pointer'
              }}
            >
              {Object.entries(products).map(([key, product]) => (
                <option key={key} value={key}>{product.title}</option>
              ))}
            </select>
            <div style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none'
            }}>
              <Icon name="ChevronDown" size={16} color={currentTheme.textSecondary} />
            </div>
          </div>
        </div>

        {/* Previous Chats Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          marginBottom: '16px' 
        }}>
          <h2 style={{ 
            fontSize: '12px', 
            fontWeight: '600',
            color: currentTheme.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            margin: 0
          }}>
            Previous Chats
          </h2>
          <button 
            onClick={handleNewChat}
            style={{
              background: 'none',
              border: 'none',
              color: currentTheme.textSecondary,
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              transition: 'color 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => e.target.style.color = currentTheme.text}
            onMouseLeave={(e) => e.target.style.color = currentTheme.textSecondary}
          >
            <Icon name="Plus" size={16} />
          </button>
        </div>

        {/* Chat History */}
        <nav style={{ 
          flex: 1, 
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          overflowY: 'auto',
          paddingRight: '8px',
          marginBottom: '24px'
        }}>
          {chatHistory.map((chat) => (
            <div
              key={chat.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px',
                backgroundColor: chat.active ? currentTheme.chatLinkBg : 'transparent',
                border: chat.active ? `1px solid ${currentTheme.chatLinkBorder}` : '1px solid transparent',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                position: 'relative',
                group: true
              }}
            >
              <button
                onClick={() => handleChatSelect(chat.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  color: chat.active ? currentTheme.accent : currentTheme.chatLinkText,
                  textDecoration: 'none',
                  fontWeight: chat.active ? '600' : '400',
                  fontSize: '14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  padding: 0
                }}
              >
                <span style={{ fontSize: '16px' }}>{chat.icon}</span>
                <span style={{ flex: 1, textAlign: 'left' }}>{chat.title}</span>
              </button>
              <button
                onClick={(e) => handleDeleteChat(chat.id, e)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: currentTheme.textMuted,
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  opacity: 0.6,
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = currentTheme.deleteButton;
                  e.target.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = currentTheme.textMuted;
                  e.target.style.opacity = '0.6';
                }}
              >
                <Icon name="Trash" size={14} />
              </button>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div style={{ 
          paddingTop: '16px', 
          borderTop: `1px solid ${currentTheme.border}` 
        }}>
          {/* Status Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.1)',
            border: `1px solid ${isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
            color: isDarkMode ? '#10b981' : '#059669',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon name="ShieldCheck" size={16} />
              <span style={{ fontSize: '14px', fontWeight: '500' }}>Hybrid AI Ready</span>
            </div>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              animation: 'pulse 2s infinite'
            }}></div>
          </div>

          {/* Response Mode */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px',
            borderRadius: '8px',
            marginBottom: '8px',
            transition: 'background-color 0.2s ease'
          }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: currentTheme.text }}>Response Mode</span>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: currentTheme.buttonBg,
              padding: '4px',
              borderRadius: '6px',
              border: `1px solid ${currentTheme.border}`
            }}>
              <button 
                onClick={() => setForceMode('local')}
                style={{
                  padding: '4px 8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: forceMode === 'local' ? currentTheme.accent : 'transparent',
                  color: forceMode === 'local' ? 'white' : currentTheme.textSecondary
                }}
              >
                Local
              </button>
              <button 
                onClick={() => setForceMode('ai')}
                style={{
                  padding: '4px 8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: forceMode === 'ai' ? currentTheme.accent : 'transparent',
                  color: forceMode === 'ai' ? 'white' : currentTheme.textSecondary
                }}
              >
                AI
              </button>
            </div>
          </div>

          {/* Analysis Mode */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px',
            borderRadius: '8px',
            marginBottom: '8px',
            transition: 'background-color 0.2s ease'
          }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: currentTheme.text }}>Analysis Mode</span>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              backgroundColor: currentTheme.buttonBg,
              padding: '2px',
              borderRadius: '6px',
              border: `1px solid ${currentTheme.border}`
            }}>
              <button 
                onClick={() => setAnalysisMode('general')}
                style={{
                  padding: '4px 6px',
                  fontSize: '11px',
                  fontWeight: '600',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: analysisMode === 'general' ? currentTheme.accent : 'transparent',
                  color: analysisMode === 'general' ? 'white' : currentTheme.textSecondary
                }}
              >
                General
              </button>
              <button 
                onClick={() => setAnalysisMode('bug')}
                style={{
                  padding: '4px 6px',
                  fontSize: '11px',
                  fontWeight: '600',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: analysisMode === 'bug' ? currentTheme.accent : 'transparent',
                  color: analysisMode === 'bug' ? 'white' : currentTheme.textSecondary
                }}
              >
                Bug
              </button>
              <button 
                onClick={() => setAnalysisMode('format')}
                style={{
                  padding: '4px 6px',
                  fontSize: '11px',
                  fontWeight: '600',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: analysisMode === 'format' ? currentTheme.accent : 'transparent',
                  color: analysisMode === 'format' ? 'white' : currentTheme.textSecondary
                }}
              >
                Format
              </button>
            </div>
          </div>

          {/* Format Type (only show when Format mode is selected) */}
          {analysisMode === 'format' && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px',
              borderRadius: '8px',
              marginBottom: '8px',
              backgroundColor: currentTheme.chatLinkBg,
              border: `1px solid ${currentTheme.chatLinkBorder}`,
              transition: 'background-color 0.2s ease'
            }}>
              <span style={{ fontSize: '14px', fontWeight: '500', color: currentTheme.text }}>Template</span>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: currentTheme.buttonBg,
                padding: '4px',
                borderRadius: '6px',
                border: `1px solid ${currentTheme.border}`
              }}>
                <button 
                  onClick={() => setFormatType('user_story')}
                  style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: formatType === 'user_story' ? currentTheme.accent : 'transparent',
                    color: formatType === 'user_story' ? 'white' : currentTheme.textSecondary
                  }}
                >
                  User Story
                </button>
                <button 
                  onClick={() => setFormatType('bug_report')}
                  style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: formatType === 'bug_report' ? currentTheme.accent : 'transparent',
                    color: formatType === 'bug_report' ? 'white' : currentTheme.textSecondary
                  }}
                >
                  Bug Report
                </button>
              </div>
            </div>
          )}

          {/* Theme Toggle */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px',
            borderRadius: '8px'
          }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: currentTheme.text }}>Theme</span>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: currentTheme.buttonBg,
              padding: '4px',
              borderRadius: '6px',
              border: `1px solid ${currentTheme.border}`
            }}>
              <button 
                onClick={() => setIsDarkMode(false)}
                style={{
                  padding: '6px 8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: !isDarkMode ? currentTheme.accent : 'transparent',
                  color: !isDarkMode ? 'white' : currentTheme.textSecondary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Icon name="Sun" size={14} />
              </button>
              <button 
                onClick={() => setIsDarkMode(true)}
                style={{
                  padding: '6px 8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: isDarkMode ? currentTheme.accent : 'transparent',
                  color: isDarkMode ? 'white' : currentTheme.textSecondary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Icon name="Moon" size={14} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <header style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '16px 24px', 
          borderBottom: `1px solid ${currentTheme.border}`,
          backgroundColor: currentTheme.cardBg,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)'
        }}>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: currentTheme.textSecondary,
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '4px',
              display: 'none'
            }}
          >
            <Icon name="Menu" size={20} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>{currentProduct.icon}</span>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: '600',
              color: currentTheme.text,
              margin: 0
            }}>
              {currentProduct.title}
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ 
              fontSize: '12px', 
              color: 'white',
              backgroundColor: analysisMode === 'bug' ? '#ef4444' : analysisMode === 'format' ? '#8b5cf6' : currentTheme.accent,
              padding: '4px 8px',
              borderRadius: '6px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {analysisMode === 'bug' ? '🐛 Bug Analysis' : 
               analysisMode === 'format' ? `📋 ${formatType === 'user_story' ? 'User Story' : 'Bug Report'}` : 
               '💬 General'}
            </span>
            <span style={{ fontSize: '14px', color: currentTheme.textSecondary }}>
              AI Enhanced - {currentProduct.description}
            </span>
          </div>
        </header>

        {/* Chat Messages */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          overflowY: 'auto',
          padding: '0'
        }}>
          <div style={{ width: '100%', maxWidth: '1024px', padding: '24px', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* Welcome Message */}
              {messages.length === 1 && (
                <div style={{
                  border: `1px solid ${currentTheme.border}`,
                  borderRadius: '12px',
                  padding: '24px',
                  backgroundColor: currentTheme.cardBg,
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)'
                }}>
                  <h3 style={{ 
                    fontSize: '20px', 
                    fontWeight: '700', 
                    color: currentTheme.text, 
                    marginBottom: '8px',
                    margin: '0 0 8px 0'
                  }}>
                    Welcome to TriTech Enterprise Assistant
                  </h3>
                  <p style={{ 
                    color: currentTheme.textSecondary,
                    lineHeight: '1.6',
                    margin: 0
                  }}>
                    I'm your intelligent assistant for the Premium Pro Enterprise workbook with hybrid AI capabilities. I can handle both simple queries locally and complex analysis using advanced AI. Select a product and ask me anything about TriTech Enterprise!
                  </p>
                </div>
              )}

              {/* Chat Messages */}
              {messages.slice(1).map((message, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
                }}>
                  {message.role === 'assistant' && (
                    <div style={{
                      width: '36px',
                      height: '36px',
                      backgroundColor: currentTheme.buttonBg,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Icon name="AIRobot" size={18} color={currentTheme.textSecondary} />
                    </div>
                  )}
                  
                  <div style={{
                    borderRadius: '12px',
                    padding: '16px',
                    maxWidth: '512px',
                    backgroundColor: message.role === 'user' ? currentTheme.accent : currentTheme.buttonBg,
                    color: message.role === 'user' ? 'white' : currentTheme.text,
                    borderTopLeftRadius: message.role === 'assistant' ? '4px' : '12px',
                    borderTopRightRadius: message.role === 'user' ? '4px' : '12px'
                  }}>
                    <div>{formatMessage(message.content)}</div>
                    
                    {message.role === 'assistant' && message.source && (
                      <div style={{ 
                        marginTop: '12px', 
                        paddingTop: '12px', 
                        borderTop: `1px solid ${currentTheme.border}` 
                      }}>
                        {getSourceBadge(message.source, message.analysisMode)}
                      </div>
                    )}
                  </div>

                  {message.role === 'user' && (
                    <div style={{
                      width: '36px',
                      height: '36px',
                      backgroundColor: currentTheme.buttonBg,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Icon name="User" size={18} color={currentTheme.textSecondary} />
                    </div>
                  )}
                </div>
              ))}

              {/* Sample Questions for Welcome State */}
              {messages.length === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <p style={{ 
                    fontWeight: '500', 
                    color: currentTheme.text, 
                    marginBottom: '8px',
                    margin: '0 0 8px 0'
                  }}>
                    Try asking about:
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {currentProduct.questions.slice(0, 3).map((question, index) => (
                      <button
                        key={index}
                        onClick={(e) => handleSubmit(e, question)}
                        style={{
                          backgroundColor: isDarkMode ? 'rgba(55, 65, 81, 0.5)' : 'rgba(209, 213, 219, 0.8)',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '6px 12px',
                          fontSize: '14px',
                          color: currentTheme.text,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = currentTheme.buttonHover;
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = isDarkMode ? 'rgba(55, 65, 81, 0.5)' : 'rgba(209, 213, 219, 0.8)';
                        }}
                      >
                        "{question}"
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Loading indicator with AI Robot */}
              {isLoading && (
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px'
                }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    backgroundColor: currentTheme.buttonBg,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icon name="AIRobot" size={18} color={currentTheme.textSecondary} />
                  </div>
                  <div style={{
                    backgroundColor: currentTheme.buttonBg,
                    borderRadius: '12px',
                    borderTopLeftRadius: '4px',
                    padding: '16px',
                    maxWidth: '512px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: currentTheme.textSecondary }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            style={{
                              width: '8px',
                              height: '8px',
                              backgroundColor: currentTheme.textMuted,
                              borderRadius: '50%',
                              animation: `pulse 1.4s ease-in-out ${i * 0.16}s infinite`
                            }}
                          />
                        ))}
                      </div>
                      <span style={{ marginLeft: '8px' }}>AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Chat Input */}
        <div style={{ 
          width: '100%', 
          maxWidth: '1024px', 
          margin: '0 auto', 
          padding: '24px 24px 24px 24px' 
        }}>
          <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              rows="1"
              style={{
                width: '100%',
                backgroundColor: currentTheme.inputBg,
                border: `1px solid ${currentTheme.inputBorder}`,
                borderRadius: '12px',
                resize: 'none',
                padding: '16px 24px 16px 20px',
                paddingRight: '64px',
                color: currentTheme.text,
                fontSize: '16px',
                lineHeight: '1.5',
                outline: 'none',
                minHeight: '56px',
                maxHeight: '200px',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
              }}
              placeholder={`Ask me anything about ${currentProduct.title}...`}
              disabled={isLoading}
              onFocus={(e) => {
                e.target.style.borderColor = currentTheme.accent;
                e.target.style.boxShadow = `0 0 0 3px ${currentTheme.accent}20`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = currentTheme.inputBorder;
                e.target.style.boxShadow = 'none';
              }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: currentTheme.accent,
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isLoading || !input.trim() ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!isLoading && input.trim()) {
                  e.target.style.backgroundColor = currentTheme.accentHover;
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = currentTheme.accent;
              }}
            >
              <Icon name="Send" size={18} color="white" />
            </button>
          </form>
        </div>
      </main>

      {/* Add CSS animations */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        /* Scrollbar styles */
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: ${currentTheme.textMuted};
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: ${currentTheme.textSecondary};
        }
      `}</style>
    </div>
  );
}
