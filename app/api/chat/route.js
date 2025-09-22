import { NextResponse } from 'next/server';

const SUPABASE_PROJECT_ID = 'duaudazaqleaxbowqxsw';

// Function to get database knowledge
async function getDatabaseKnowledge() {
  try {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    const command = `manus-mcp-cli tool call execute_sql --server supabase --input '{"project_id": "${SUPABASE_PROJECT_ID}", "query": "SELECT * FROM knowledge_entries ORDER BY created_at DESC;"}'`;
    
    const { stdout } = await execAsync(command);
    const result = JSON.parse(stdout.split('\n').find(line => line.startsWith('[')));
    return result || [];
  } catch (error) {
    console.error('Error fetching database knowledge:', error);
    return [];
  }
}

// Function to search database knowledge
function searchDatabaseKnowledge(query, dbEntries) {
  const queryLower = query.toLowerCase();
  const matches = [];

  for (const entry of dbEntries) {
    let score = 0;
    
    // Check question match
    if (entry.question.toLowerCase().includes(queryLower)) {
      score += 10;
    }
    
    // Check keywords match
    if (entry.keywords && entry.keywords.toLowerCase().includes(queryLower)) {
      score += 8;
    }
    
    // Check individual words
    const queryWords = queryLower.split(' ').filter(word => word.length > 2);
    for (const word of queryWords) {
      if (entry.question.toLowerCase().includes(word)) score += 3;
      if (entry.answer.toLowerCase().includes(word)) score += 2;
      if (entry.keywords && entry.keywords.toLowerCase().includes(word)) score += 2;
    }
    
    if (score > 0) {
      matches.push({ ...entry, score });
    }
  }
  
  return matches.sort((a, b) => b.score - a.score);
}

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

**Electronic Filing Support:**
• Direct integration with state systems
• Batch processing capabilities
• Real-time validation and error checking
• Confirmation receipts and tracking

**Multi-State Management:**
• Consolidated filing across multiple jurisdictions
• State-specific calculation methods
• Automated apportionment calculations
• Cross-state reporting and reconciliation

*Reference: Premium Tax Module Guide, Chapter 1-2, Pages 15-35*`,
    confidence: 'high',
    source: 'local'
  },
  'formsplus capabilities': {
    response: `**FormsPlus Module - Comprehensive Capabilities:**

**Core Features:**
• 1000+ state forms and filings
• Automated form population from Premium Tax data
• Electronic filing integration
• Form template management
• Multi-state form coordination

**Key Capabilities:**
• **Form Library**: Access to extensive library of state-specific forms
• **Data Integration**: Seamless integration with Premium Tax calculations
• **Batch Processing**: Handle multiple forms and filings simultaneously
• **Validation Engine**: Built-in validation to ensure accuracy
• **Amendment Support**: Easy amendment and correction processing

**Electronic Filing:**
• Direct submission to state agencies
• Real-time status tracking
• Confirmation receipts
• Error handling and resubmission

**Workflow Management:**
• Automated form routing and approval
• Due date tracking and reminders
• Compliance monitoring
• Audit trail maintenance

*Reference: FormsPlus Module Guide, Chapter 1, Pages 8-25*`,
    confidence: 'high',
    source: 'local'
  }
};

// Function to check if AI should be used
function shouldUseAI(message) {
  const aiTriggers = [
    'compare', 'analysis', 'analyze', 'comprehensive', 'detailed analysis',
    'integration between', 'explain relationship', 'how do they work together'
  ];
  
  const messageLower = message.toLowerCase();
  return aiTriggers.some(trigger => messageLower.includes(trigger)) || message.length > 50;
}

// Function to find best match in knowledge base
function findBestMatch(query) {
  const queryLower = query.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;

  for (const [key, data] of Object.entries(knowledgeBase)) {
    let score = 0;
    
    // Exact key match
    if (queryLower.includes(key)) {
      score += 10;
    }
    
    // Word matching
    const queryWords = queryLower.split(' ').filter(word => word.length > 2);
    const keyWords = key.split(' ');
    
    for (const queryWord of queryWords) {
      for (const keyWord of keyWords) {
        if (queryWord === keyWord) {
          score += 5;
        } else if (queryWord.includes(keyWord) || keyWord.includes(queryWord)) {
          score += 2;
        }
      }
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = data;
    }
  }
  
  return bestScore > 3 ? bestMatch : null;
}

export async function POST(request) {
  try {
    const { message, forceMode } = await request.json();
    
    console.log('🔍 Processing query:', message);
    console.log('🎯 Force mode:', forceMode);

    // Get database knowledge
    const dbKnowledge = await getDatabaseKnowledge();
    console.log('📚 Database entries loaded:', dbKnowledge.length);

    // Check if we should use AI
    const useAI = forceMode === 'ai' || (forceMode !== 'local' && shouldUseAI(message));
    console.log('🤖 Should use AI:', useAI);

    if (useAI && process.env.CLAUDE_API_KEY) {
      console.log('🚀 Attempting Claude API call...');
      try {
        // Include database knowledge as context for AI
        let contextInfo = '';
        if (dbKnowledge.length > 0) {
          const relevantEntries = searchDatabaseKnowledge(message, dbKnowledge).slice(0, 3);
          if (relevantEntries.length > 0) {
            contextInfo = '\n\nRelevant knowledge from database:\n' + 
              relevantEntries.map(entry => `Q: ${entry.question}\nA: ${entry.answer}`).join('\n\n');
          }
        }

        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.CLAUDE_API_KEY,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 1000,
            messages: [{
              role: 'user',
              content: `You are a TriTech Enterprise Assistant expert. Answer this question about TriTech Premium Pro Enterprise software: ${message}${contextInfo}`
            }]
          })
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Claude API success');
          return NextResponse.json({
            response: data.content[0].text,
            source: 'ai',
            confidence: 'high'
          });
        } else {
          console.log('❌ Claude API error:', response.status, response.statusText);
        }
      } catch (error) {
        console.log('❌ Claude API exception:', error.message);
      }
    }

    // Try database knowledge first
    if (dbKnowledge.length > 0) {
      const dbMatches = searchDatabaseKnowledge(message, dbKnowledge);
      if (dbMatches.length > 0 && dbMatches[0].score > 5) {
        console.log('✅ Database knowledge match found');
        return NextResponse.json({
          response: dbMatches[0].answer,
          source: 'local',
          confidence: dbMatches[0].score > 8 ? 'high' : 'medium'
        });
      }
    }

    // Fall back to built-in knowledge base
    const localMatch = findBestMatch(message);
    if (localMatch) {
      console.log('✅ Local knowledge match found');
      return NextResponse.json({
        response: localMatch.response,
        source: 'local',
        confidence: localMatch.confidence
      });
    }

    // No match found
    console.log('❌ No knowledge match found');
    return NextResponse.json({
      response: `I understand you're asking about "${message}". While I have extensive knowledge of the TriTech Premium Pro Enterprise system, I don't have specific information about that topic in my current knowledge base.

I can help you with:
• Premium Tax features and procedures
• Municipal Tax rollover processes
• FormsPlus capabilities and form management
• Integration between modules
• State-specific filing requirements

Try asking about:
• "List all Premium Tax features"
• "How does Municipal rollover work?"
• "What are FormsPlus capabilities?"
• "Compare Premium Tax vs Municipal features"

Would you like information on any of these topics?`,
      source: 'local',
      confidence: 'low'
    });

  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({
      response: 'I apologize, but I encountered an error processing your request. Please try again.',
      source: 'error',
      confidence: 'low'
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
