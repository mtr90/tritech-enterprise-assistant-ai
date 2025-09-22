import { NextResponse } from 'next/server';

const SUPABASE_PROJECT_ID = 'duaudazaqleaxbowqxsw';

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
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
