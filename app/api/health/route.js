import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if required environment variables are present
    const hasClaudeKey = !!(process?.env?.CLAUDE_API_KEY);
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        claude_api: hasClaudeKey ? 'configured' : 'not_configured',
        environment: process?.env?.NODE_ENV || 'development'
      }
    };
    
    return NextResponse.json(health);
  } catch (_error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: 'Health check failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
