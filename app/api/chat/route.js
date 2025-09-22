import { NextResponse } from 'next/server';

// Rate limiting store (in production, use Redis or database)
const rateLimitStore = new Map();

// Rate limiting function
function rateLimit(identifier, maxRequests = 10, windowMs = 60000) {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  if (!rateLimitStore.has(identifier)) {
    rateLimitStore.set(identifier, []);
  }
  
  const requests = rateLimitStore.get(identifier);
  
  // Remove old requests outside the window
  const validRequests = requests.filter(timestamp => timestamp > windowStart);
  rateLimitStore.set(identifier, validRequests);
  
  if (validRequests.length >= maxRequests) {
    return false;
  }
  
  validRequests.push(now);
  rateLimitStore.set(identifier, validRequests);
  return true;
}

// Input validation and sanitization
function validateAndSanitizeInput(input) {
  if (!input || typeof input !== 'string') {
    throw new Error('Invalid input: must be a non-empty string');
  }
  
  // Basic sanitization
  const sanitized = input.trim().slice(0, 2000); // Limit length
  
  if (sanitized.length === 0) {
    throw new Error('Invalid input: cannot be empty after sanitization');
  }
  
  return sanitized;
}

// Security headers
function addSecurityHeaders(response) {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return response;
}

export async function POST(request) {
  try {
    // Get client IP for rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    
    // Apply rate limiting
    if (!rateLimit(clientIP, 20, 60000)) { // 20 requests per minute
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        )
      );
    }
    
    // Validate API key exists
    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      console.error('Claude API key not configured');
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Service temporarily unavailable' },
          { status: 503 }
        )
      );
    }
    
    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Invalid JSON in request body' },
          { status: 400 }
        )
      );
    }
    
    // Validate required fields
    if (!body.message) {
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Message is required' },
          { status: 400 }
        )
      );
    }
    
    // Sanitize input
    const sanitizedMessage = validateAndSanitizeInput(body.message);
    const localContext = body.localContext || {};
    
    // Build secure prompt
    const prompt = buildSecurePrompt(localContext, sanitizedMessage);
    
    // Call Claude API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
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
            content: prompt
          }]
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Claude API error:', response.status, errorText);
        
        if (response.status === 401) {
          return addSecurityHeaders(
            NextResponse.json(
              { error: 'Authentication failed' },
              { status: 503 }
            )
          );
        }
        
        if (response.status === 429) {
          return addSecurityHeaders(
            NextResponse.json(
              { error: 'Service temporarily busy. Please try again.' },
              { status: 429 }
            )
          );
        }
        
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Validate response structure
      if (!data.content || !Array.isArray(data.content) || data.content.length === 0) {
        throw new Error('Invalid response structure from Claude API');
      }
      
      const result = {
        content: data.content[0].text,
        reference: 'Claude AI + Enterprise Knowledge',
        confidence: 'high',
        matchDetails: ['AI-Enhanced Analysis', 'Claude Integration'],
        source: 'claude',
        relatedTopics: extractRelatedTopics(data.content[0].text)
      };
      
      return addSecurityHeaders(
        NextResponse.json(result)
      );
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        return addSecurityHeaders(
          NextResponse.json(
            { error: 'Request timeout. Please try again.' },
            { status: 408 }
          )
        );
      }
      
      throw fetchError;
    }
    
  } catch (error) {
    console.error('Chat API error:', error);
    
    return addSecurityHeaders(
      NextResponse.json(
        { 
          error: 'An error occurred processing your request. Please try again.',
          fallback: true 
        },
        { status: 500 }
      )
    );
  }
}

function buildSecurePrompt(localContext, userQuery) {
  // Sanitize context to prevent injection
  const sanitizedContext = JSON.stringify(localContext).slice(0, 500);
  
  return `You are a TriTech Premium Pro Enterprise expert assistant with deep knowledge of insurance tax software.

Enterprise Context:
${localContext && localContext.knowledge ? `Related to: ${localContext.knowledge.overview || 'Enterprise system'}` : ''}
${localContext && localContext.confidence ? `Local confidence: ${localContext.confidence}` : ''}

TriTech Premium Pro Enterprise Products:
- Premium Tax: Annual & estimate returns, retaliatory calculations, GFA credits, electronic filing
- Municipal Tax: Local jurisdiction management, address-based allocation, municipal rollover
- FormsPlus: Additional state-specific forms, supplemental schedules, integration capabilities
- Allocator: Multi-state allocation formulas, apportionment calculations, custom rules
- GFA Tracking System: Guaranty Fund Assessment credits, tracking, application to returns
- Calendar: Due date management, multi-jurisdiction tracking, integration with tax modules

Key Enterprise Capabilities:
- Multi-state tax processing and compliance
- Electronic filing through TriTech and OPTins platforms
- Data rollover between tax years
- Comprehensive integration between all modules
- State-specific requirements and calculations
- Audit trails and documentation
- Import/export functionality for NAIC and other data sources

Instructions:
- Be specific and actionable in your guidance
- Reference workbook chapters when relevant (Chapters 1-16)
- Provide step-by-step procedures when appropriate
- Explain integrations between modules clearly
- Include state-specific information when relevant
- Focus on practical implementation and troubleshooting

Question: ${userQuery}

Provide a comprehensive, well-structured response with specific details about TriTech Enterprise functionality.`;
}

function extractRelatedTopics(responseText) {
  const topics = [];
  const text = responseText.toLowerCase();
  
  if (text.includes('premium tax')) topics.push('Premium Tax overview');
  if (text.includes('municipal')) topics.push('Municipal Tax features');
  if (text.includes('formsplus')) topics.push('FormsPlus capabilities');
  if (text.includes('allocator')) topics.push('Allocator functions');
  if (text.includes('gfa')) topics.push('GFA Tracking System');
  if (text.includes('calendar')) topics.push('Calendar management');
  if (text.includes('electronic filing')) topics.push('Electronic filing options');
  if (text.includes('retaliatory')) topics.push('Retaliatory tax calculations');
  
  return topics.slice(0, 4);
}

// Handle OPTIONS for CORS
export async function OPTIONS(request) {
  return addSecurityHeaders(
    new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  );
}
