'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Bot, User, Zap, Brain, AlertCircle, CheckCircle, Clock } from 'lucide-react';

// Comprehensive Knowledge Base from Premium Pro Enterprise Workbook
const knowledgeBase = {
  'premium-tax-overview': {
    keywords: ['premium tax', 'annual', 'estimates', 'features', 'overview', 'premium', 'tax module'],
    synonyms: ['premium', 'tax module', 'annual returns', 'premium tax module'],
    context: ['tax', 'premium', 'annual', 'state', 'return', 'filing'],
    negations: ['not working', 'error in', 'problem with', 'issue with'],
    phrases: ['premium tax features', 'what does premium tax do', 'premium tax capabilities'],
    
    overview: 'Premium Tax module handles annual and estimate returns for insurance premium tax compliance across all states.',
    features: [
      'Annual and estimate return preparation',
      'Retaliatory tax calculations and worksheets',
      'GFA credit tracking and worksheets',
      'Electronic filing (TriTech, OPTins, state websites)',
      'Multi-state filing capabilities',
      'Automated tax calculations',
      'Supporting schedules and attachments',
      'Amendment processing',
      'Comprehensive reporting and summaries',
      'Data import/export functionality',
      'State-specific forms and requirements',
      'Audit trail and documentation'
    ],
    procedures: {
      'setup': 'Configure company information, state registrations, and tax rates through the Company Information schedules.',
      'filing': 'Complete data entry, review calculations, generate forms, and submit electronically or print for manual filing.',
      'amendments': 'Use amendment features to correct previously filed returns with proper documentation.'
    },
    troubleshooting: {
      'calculation_errors': 'Verify rate schedules, GFA credits, and retaliatory calculations in supporting worksheets.',
      'filing_issues': 'Check electronic filing credentials and state-specific requirements.',
      'data_import': 'Ensure proper file format and mapping for NAIC or other data imports.'
    },
    integrations: {
      'formsplus': 'Seamless integration with FormsPlus for additional state forms and requirements.',
      'gfa_tracking': 'Direct integration with GFA Tracking System for credit management.',
      'municipal': 'Data sharing capabilities with Municipal Tax module for comprehensive tax management.'
    },
    stateSpecific: {
      'kentucky': 'Quarterly filing requirements with specific forms and calculation methods.',
      'retaliatory': 'Automated retaliatory tax calculations based on home state vs. filing state rates.',
      'electronic_filing': 'State-specific electronic filing options including TriTech and OPTins platforms.'
    },
    pageReference: 'Chapters 1-11, Pages 1-130'
  },
  // Additional knowledge base entries would go here...
};

// Advanced fuzzy matching and search algorithms
class FuzzyMatcher {
  static levenshteinDistance(str1, str2) {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  }

  static calculateSimilarity(str1, str2) {
    const maxLength = Math.max(str1.length, str2.length);
    if (maxLength === 0) return 1;
    const distance = this.levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
    return 1 - distance / maxLength;
  }

  static findBestMatches(query, knowledgeBase) {
    const results = [];
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/);

    for (const [key, knowledge] of Object.entries(knowledgeBase)) {
      let score = 0;
      let matchDetails = [];

      // Exact keyword matches (highest weight)
      for (const keyword of knowledge.keywords) {
        if (queryLower.includes(keyword.toLowerCase())) {
          score += 10;
          matchDetails.push(`Keyword: "${keyword}"`);
        }
      }

      // Phrase matches
      for (const phrase of knowledge.phrases || []) {
        const similarity = this.calculateSimilarity(queryLower, phrase.toLowerCase());
        if (similarity > 0.6) {
          score += similarity * 8;
          matchDetails.push(`Phrase: "${phrase}" (${Math.round(similarity * 100)}%)`);
        }
      }

      // Synonym matches
      for (const synonym of knowledge.synonyms) {
        if (queryLower.includes(synonym.toLowerCase())) {
          score += 6;
          matchDetails.push(`Synonym: "${synonym}"`);
        }
      }

      // Context word matches
      for (const contextWord of knowledge.context) {
        if (queryWords.some(word => this.calculateSimilarity(word, contextWord) > 0.8)) {
          score += 3;
          matchDetails.push(`Context: "${contextWord}"`);
        }
      }

      if (score > 0) {
        results.push({
          key,
          knowledge,
          score,
          matchDetails,
          confidence: score > 15 ? 'high' : score > 8 ? 'medium' : 'low'
        });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }
}

// Smart routing function
function shouldUseClaudeAPI(query, localConfidence) {
  const q = query.toLowerCase();
  
  // Use Claude for complex queries
  if (localConfidence < 0.4) return true;
  if (q.includes('compare') || q.includes('vs') || q.includes('versus')) return true;
  if (q.includes('list all') || q.includes('show all') || q.includes('all features')) return true;
  if (q.includes('analyze') || q.includes('explain why')) return true;
  if (q.includes('difference between')) return true;
  if (q.includes('relationship') || q.includes('integration')) return true;
  if (q.includes('data flow') || q.includes('workflow')) return true;
  if (query.split(' ').length > 10) return true;
  
  return false; // Keep simple queries local
}

export default function TriTechAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Check API health on component mount
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      const response = await fetch('/api/health');
      const health = await response.json();
      
      if (health.status === 'healthy' && health.services.claude_api === 'configured') {
        setApiStatus('ready');
      } else {
        setApiStatus('local-only');
      }
    } catch (error) {
      console.error('Health check failed:', error);
      setApiStatus('local-only');
    }
  };

  const generateLocalResponse = (bestMatch, query) => {
    if (!bestMatch) {
      return {
        content: `I couldn't find specific information about "${query}" in the Premium Pro Enterprise workbook. Could you try rephrasing your question or ask about one of these topics:\n\n• Premium Tax features and capabilities\n• Municipal Tax management\n• FormsPlus additional forms\n• Calendar and due date management\n• Allocator apportionment\n• GFA Tracking System\n• Electronic filing options\n• Retaliatory tax calculations`,
        confidence: 'low',
        matchDetails: ['No direct matches found'],
        reference: 'Premium Pro Enterprise Workbook',
        relatedTopics: ['Premium Tax overview', 'Municipal Tax features', 'FormsPlus capabilities', 'Calendar management'],
        source: 'local'
      };
    }

    const knowledge = bestMatch.knowledge;
    let content = `**${knowledge.overview}**\n\n`;

    // Determine response type based on query intent
    const queryLower = query.toLowerCase();
    const isFeatureQuery = queryLower.includes('features') || queryLower.includes('capabilities') || queryLower.includes('what can') || queryLower.includes('list all');

    if (isFeatureQuery && knowledge.features) {
      content += `**Key Features:**\n`;
      knowledge.features.forEach(feature => {
        content += `• ${feature}\n`;
      });
    } else if (knowledge.features && knowledge.features.length > 0) {
      content += `**Key Capabilities:**\n`;
      knowledge.features.slice(0, 5).forEach(feature => {
        content += `• ${feature}\n`;
      });
      if (knowledge.features.length > 5) {
        content += `• *...and more*\n`;
      }
    }

    // Add integration information if relevant
    if (knowledge.integrations && Object.keys(knowledge.integrations).length > 0) {
      content += `\n**Integrations:**\n`;
      for (const [system, description] of Object.entries(knowledge.integrations)) {
        content += `**${system.charAt(0).toUpperCase() + system.slice(1)}:** ${description}\n`;
      }
    }

    // Generate related topics
    const relatedTopics = [];
    if (knowledge.integrations) {
      Object.keys(knowledge.integrations).forEach(integration => {
        relatedTopics.push(`${integration} overview`);
      });
    }
    
    const generalTopics = ['Electronic filing options', 'Data import procedures', 'Retaliatory tax calculations'];
    relatedTopics.push(...generalTopics.filter(topic => !relatedTopics.includes(topic)).slice(0, 3));

    return {
      content,
      confidence: bestMatch.confidence,
      matchDetails: bestMatch.matchDetails.slice(0, 3),
      reference: knowledge.pageReference || 'Premium Pro Enterprise Workbook',
      relatedTopics: relatedTopics.slice(0, 4),
      source: 'local'
    };
  };

  const generateResponse = async (query) => {
    const matches = FuzzyMatcher.findBestMatches(query, knowledgeBase);
    const bestMatch = matches.length > 0 ? matches[0] : null;
    const localConfidence = bestMatch ? (bestMatch.score / 20) : 0;

    // Try Claude API for complex queries if available
    if (apiStatus === 'ready' && shouldUseClaudeAPI(query, localConfidence)) {
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: query,
            localContext: bestMatch
          }),
        });

        if (response.ok) {
          const claudeResponse = await response.json();
          if (!claudeResponse.fallback) {
            return claudeResponse;
          }
        }
      } catch (error) {
        console.error('Claude API failed, falling back to local:', error);
      }
    }
    
    // Fall back to local response logic
    return generateLocalResponse(bestMatch, query);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now(),
      content: userMessage,
      sender: 'user',
      timestamp: new Date()
    }]);

    try {
      const response = await generateResponse(userMessage);
      
      // Add assistant response
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        content: response.content,
        sender: 'assistant',
        confidence: response.confidence,
        matchDetails: response.matchDetails,
        reference: response.reference,
        relatedTopics: response.relatedTopics,
        source: response.source,
        timestamp: new Date()
      }]);
      
    } catch (error) {
      console.error('Error generating response:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        sender: 'assistant',
        confidence: 'low',
        source: 'local',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const askQuestion = (question) => {
    setInput(question);
  };

  const getStatusBadge = () => {
    switch (apiStatus) {
      case 'ready':
        return <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">Hybrid AI Ready</Badge>;
      case 'local-only':
        return <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">Local Mode Only</Badge>;
      case 'checking':
        return <Badge className="bg-gray-500 text-white">Checking Status...</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">Unknown Status</Badge>;
    }
  };

  const getConfidenceIcon = (confidence) => {
    switch (confidence) {
      case 'high':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'medium':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'low':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getSourceIcon = (source) => {
    return source === 'claude' ? 
      <Brain className="w-4 h-4 text-blue-500" /> : 
      <Zap className="w-4 h-4 text-green-500" />;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary">TriTech Enterprise Assistant</h1>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              {getStatusBadge()}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Welcome Message */}
        {messages.length === 0 && (
          <Card className="mb-6">
            <CardContent className="p-8 text-center">
              <div className="mb-4">
                <Badge className="bg-gradient-to-r from-purple-500 to-blue-600 text-white mb-4">
                  🤖 AI Enhanced Intelligence
                </Badge>
              </div>
              <h2 className="text-2xl font-bold mb-4 text-primary">Welcome to TriTech Enterprise Assistant</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                I'm your intelligent assistant for the Premium Pro Enterprise workbook with hybrid AI capabilities. 
                I can handle both simple queries locally and complex analysis using advanced AI.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                <Button 
                  variant="outline" 
                  onClick={() => askQuestion('List all Premium Tax features')}
                  className="text-left justify-start"
                >
                  List all Premium Tax features
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => askQuestion('How does Municipal rollover work?')}
                  className="text-left justify-start"
                >
                  How does Municipal rollover work?
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => askQuestion('Compare Premium Tax vs Municipal features')}
                  className="text-left justify-start bg-gradient-to-r from-purple-500/10 to-blue-600/10"
                >
                  Compare Premium Tax vs Municipal features
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => askQuestion('Explain data flow between all products')}
                  className="text-left justify-start bg-gradient-to-r from-purple-500/10 to-blue-600/10"
                >
                  Explain data flow between all products
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Messages */}
        <div className="space-y-4 mb-6">
          {messages.map((message) => (
            <Card key={message.id} className={`${message.sender === 'user' ? 'ml-auto max-w-2xl' : 'mr-auto max-w-3xl'}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${message.sender === 'user' ? 'bg-primary' : 'bg-secondary'}`}>
                    {message.sender === 'user' ? 
                      <User className="w-4 h-4 text-primary-foreground" /> : 
                      <Bot className="w-4 h-4 text-secondary-foreground" />
                    }
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    {/* Source and Confidence Indicators */}
                    {message.sender === 'assistant' && (
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          {getSourceIcon(message.source)}
                          <span>{message.source === 'claude' ? 'AI Enhanced' : 'Fast Local'}</span>
                        </div>
                        {message.confidence && (
                          <div className="flex items-center gap-1">
                            {getConfidenceIcon(message.confidence)}
                            <span>{message.confidence.charAt(0).toUpperCase() + message.confidence.slice(1)} confidence</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Message Content */}
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      {message.content.split('\n').map((line, index) => (
                        <p key={index} className={line.startsWith('**') ? 'font-semibold' : ''}>
                          {line.replace(/\*\*(.*?)\*\*/g, '$1')}
                        </p>
                      ))}
                    </div>
                    
                    {/* Reference */}
                    {message.reference && (
                      <>
                        <Separator className="my-3" />
                        <div className="text-sm text-muted-foreground">
                          <strong>Reference:</strong> {message.reference}
                        </div>
                      </>
                    )}
                    
                    {/* Match Details */}
                    {message.matchDetails && message.matchDetails.length > 0 && (
                      <div className="text-xs text-muted-foreground italic">
                        <strong>Match Details:</strong> {message.matchDetails.join(', ')}
                      </div>
                    )}
                    
                    {/* Related Topics */}
                    {message.relatedTopics && message.relatedTopics.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Related Topics:</div>
                        <div className="flex flex-wrap gap-2">
                          {message.relatedTopics.map((topic, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={() => askQuestion(topic)}
                              className="text-xs"
                            >
                              {topic}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {/* Loading Message */}
          {isLoading && (
            <Card className="mr-auto max-w-3xl">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-secondary">
                    <Bot className="w-4 h-4 text-secondary-foreground" />
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>Analyzing query...</span>
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-primary rounded-full animate-pulse"></div>
                      <div className="w-1 h-1 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-1 h-1 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <Card className="sticky bottom-4">
          <CardContent className="p-4">
            {/* Quick Suggestions */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => askQuestion('How to set up retaliatory calculations?')}
              >
                How to set up retaliatory calculations?
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => askQuestion('List all FormsPlus capabilities and integrations')}
                className="bg-gradient-to-r from-purple-500/10 to-blue-600/10"
              >
                List all FormsPlus capabilities
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => askQuestion('Kentucky quarterly filing process')}
              >
                Kentucky quarterly filing process
              </Button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about the Premium Pro Enterprise workbook..."
                className="min-h-[60px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <Button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="px-6"
              >
                {isLoading ? 'Processing...' : 'Send'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
