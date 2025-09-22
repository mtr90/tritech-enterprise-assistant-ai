import { NextResponse } from 'next/server';

// Simple knowledge base for local responses
const knowledgeBase = {
  'municipal rollover': {
    response: `**Municipal Tax Rollover Process:**

The Municipal Tax module handles rollover functionality for multi-year tax management:

**Key Features:**
• **Automatic Data Rollover**: Seamlessly transfer prior year data to new tax year
• **Entity Management**: Maintain company and entity information across years
• **Rate Schedule Updates**: Update tax rates and calculation methods for new year
• **Historical Data Preservation**: Keep complete audit trail of prior year filings

**Rollover Process:**
1. **Backup Current Data**: System automatically creates backup before rollover
2. **Create New Year**: Initialize new tax year with updated forms and rates
3. **Transfer Entity Data**: Copy company information and entity details
4. **Update Rates**: Apply new municipal tax rates and calculation methods
5. **Verify Setup**: Review transferred data and make necessary adjustments

**Benefits:**
• Reduces data entry time by 80%
• Maintains consistency across tax years
• Preserves historical compliance records
• Streamlines annual tax preparation workflow

*Reference: Municipal Tax Module Guide, Chapter 3, Pages 45-52*`,
    confidence: 'high',
    source: 'local'
  },
  'premium tax features': {
    response: `**Premium Tax Module - Complete Feature Set:**

**Core Capabilities:**
• Annual and estimate return preparation
• Retaliatory tax calculations and worksheets
• GFA credit tracking and worksheets
• Electronic filing (TriTech, OPTins, state websites)
• Multi-state filing capabilities
• Automated tax calculations

**Advanced Features:**
• Supporting schedules and attachments
• Amendment processing
• Comprehensive reporting and summaries
• Data import/export functionality
• State-specific forms and requirements
• Audit trail and documentation

**Integration Benefits:**
• Seamless FormsPlus integration
• Direct GFA Tracking System connection
• Municipal Tax module data sharing
• Comprehensive tax management workflow

**State-Specific Support:**
• Kentucky quarterly filing requirements
• Automated retaliatory calculations
• Electronic filing options by state
• Custom forms and calculation methods

*Reference: Premium Tax Guide, Chapters 1-11, Pages 1-130*`,
    confidence: 'high',
    source: 'local'
  },
  'formsplus capabilities': {
    response: `**FormsPlus Module - Comprehensive Capabilities:**

**Form Management:**
• 500+ state-specific insurance forms
• Automatic form updates and revisions
• Electronic form completion and validation
• Multi-state form coordination

**Key Features:**
• **Smart Form Selection**: Automatically identifies required forms by state
• **Data Integration**: Pulls data from Premium Tax and Municipal modules
• **Validation Engine**: Real-time error checking and compliance verification
• **Electronic Submission**: Direct filing to state agencies where available

**Supported Form Types:**
• Annual statements and reports
• Quarterly filings and updates
• Special assessments and fees
• Regulatory compliance forms
• Amendment and correction forms

**Workflow Benefits:**
• Reduces form preparation time by 70%
• Eliminates manual form lookup
• Ensures compliance with current regulations
• Maintains complete filing history

*Reference: FormsPlus User Guide, Chapters 1-8, Pages 131-200*`,
    confidence: 'high',
    source: 'local'
  }
};

// Simple fuzzy matching function
function findBestMatch(query) {
  const queryLower = query.toLowerCase();
  
  // Direct keyword matching
  for (const [key, data] of Object.entries(knowledgeBase)) {
    if (queryLower.includes(key.toLowerCase())) {
      return data;
    }
  }
  
  // Partial matching
  const queryWords = queryLower.split(' ');
  for (const [key, data] of Object.entries(knowledgeBase)) {
    const keyWords = key.toLowerCase().split(' ');
    const matchCount = keyWords.filter(word => 
      queryWords.some(qWord => qWord.includes(word) || word.includes(qWord))
    ).length;
    
    if (matchCount >= Math.min(2, keyWords.length)) {
      return data;
    }
  }
  
  return null;
}

// Determine if query should use AI
function shouldUseAI(query) {
  const aiTriggers = [
    'compare', 'analysis', 'explain relationship', 'comprehensive',
    'detailed analysis', 'how do they work together', 'integration between'
  ];
  
  const queryLower = query.toLowerCase();
  return aiTriggers.some(trigger => queryLower.includes(trigger)) || query.length > 50;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { message } = body;
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }
    
    // Check if should use AI for complex queries FIRST
    if (shouldUseAI(message)) {
      const apiKey = process?.env?.CLAUDE_API_KEY;
      
      if (apiKey) {
        try {
          const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
              model: 'claude-3-sonnet-20240229',
              max_tokens: 1000,
              messages: [{
                role: 'user',
                content: `You are a TriTech Premium Pro Enterprise expert assistant with deep knowledge of insurance tax software. Answer this question about the system: ${message}`
              }]
            })
          });
          
          if (response.ok) {
            const data = await response.json();
            return NextResponse.json({
              response: data.content[0].text,
              source: 'ai',
              confidence: 'high',
              relatedTopics: ['Advanced Analysis', 'Integration Details', 'Workflow Optimization']
            });
          }
        } catch (error) {
          console.error('Claude API error:', error);
        }
      }
    }
    
    // Try local knowledge base for simple queries
    const localMatch = findBestMatch(message);
    
    if (localMatch) {
      return NextResponse.json({
        response: localMatch.response,
        source: 'local',
        confidence: localMatch.confidence,
        relatedTopics: ['Premium Tax Features', 'Municipal Tax Setup', 'FormsPlus Integration']
      });
    }
    

    
    // Fallback response
    return NextResponse.json({
      response: `I understand you're asking about "${message}". While I have extensive knowledge of the TriTech Premium Pro Enterprise system, I don't have specific information about that topic in my current knowledge base. 

**I can help you with:**
• Premium Tax features and procedures
• Municipal Tax rollover processes  
• FormsPlus capabilities and form management
• Integration between modules
• State-specific filing requirements

**Try asking about:**
• "List all Premium Tax features"
• "How does Municipal rollover work?"
• "What are FormsPlus capabilities?"
• "Compare Premium Tax vs Municipal features"

Would you like information on any of these topics?`,
      source: 'local',
      confidence: 'medium',
      relatedTopics: ['Premium Tax Features', 'Municipal Tax Setup', 'FormsPlus Integration']
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
