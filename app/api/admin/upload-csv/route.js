import { NextResponse } from 'next/server';

const SUPABASE_PROJECT_ID = 'duaudazaqleaxbowqxsw';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const csvFile = formData.get('file');
    const product = formData.get('product');

    if (!csvFile || !product) {
      return NextResponse.json({ error: 'CSV file and product are required' }, { status: 400 });
    }

    // Read CSV content
    const csvText = await csvFile.text();
    const lines = csvText.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV must have at least a header and one data row' }, { status: 400 });
    }

    // Parse CSV (simple parsing - assumes question,answer,keywords format)
    const entries = [];
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length >= 2) {
        entries.push({
          question: values[0] || '',
          answer: values[1] || '',
          keywords: values[2] || ''
        });
      }
    }

    if (entries.length === 0) {
      return NextResponse.json({ error: 'No valid entries found in CSV' }, { status: 400 });
    }

    // Insert entries into database
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    let insertedCount = 0;
    
    for (const entry of entries) {
      try {
        const escapedQuestion = entry.question.replace(/'/g, "''");
        const escapedAnswer = entry.answer.replace(/'/g, "''");
        const escapedKeywords = entry.keywords.replace(/'/g, "''");
        
        const query = `INSERT INTO knowledge_entries (product, question, answer, keywords) VALUES ('${product}', '${escapedQuestion}', '${escapedAnswer}', '${escapedKeywords}');`;
        
        const command = `manus-mcp-cli tool call execute_sql --server supabase --input '{"project_id": "${SUPABASE_PROJECT_ID}", "query": "${query}"}'`;
        
        await execAsync(command);
        insertedCount++;
      } catch (error) {
        console.error('Error inserting entry:', error);
      }
    }

    return NextResponse.json({ 
      success: true, 
      count: insertedCount,
      message: `Successfully uploaded ${insertedCount} entries`
    });

  } catch (error) {
    console.error('Error processing CSV upload:', error);
    return NextResponse.json({ error: 'Failed to process CSV upload' }, { status: 500 });
  }
}

// Simple CSV line parser that handles quoted fields
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result.map(field => field.replace(/^"|"$/g, ''));
}
