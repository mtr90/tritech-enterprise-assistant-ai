import { NextResponse } from 'next/server';

const SUPABASE_PROJECT_ID = 'duaudazaqleaxbowqxsw';

export async function GET() {
  try {
    // Use shell command to execute SQL via MCP
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    const command = `manus-mcp-cli tool call execute_sql --server supabase --input '{"project_id": "${SUPABASE_PROJECT_ID}", "query": "SELECT * FROM knowledge_entries ORDER BY created_at DESC;"}'`;
    
    const { stdout } = await execAsync(command);
    const result = JSON.parse(stdout.split('\n').find(line => line.startsWith('[')));
    
    return NextResponse.json({ entries: result });
  } catch (error) {
    console.error('Error fetching knowledge entries:', error);
    return NextResponse.json({ entries: [] });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    const command = `manus-mcp-cli tool call execute_sql --server supabase --input '{"project_id": "${SUPABASE_PROJECT_ID}", "query": "DELETE FROM knowledge_entries WHERE id = ${id};"}'`;
    
    await execAsync(command);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting knowledge entry:', error);
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
  }
}
