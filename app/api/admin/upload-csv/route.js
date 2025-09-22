import { NextResponse } from 'next/server';

const SUPABASE_PROJECT_ID = 'duaudazaqleaxbowqxsw';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const csvFile = formData.get('file');
    const product = formData.get('product');

    console.log('Received upload request:', { 
      hasFile: !!csvFile, 
      product,
      fileName: csvFile?.name 
    });

    if (!csvFile || !product) {
      return NextResponse.json({ error: 'CSV file and product are required' }, { status: 400 });
    }

    // Read CSV content
    const csvText = await csvFile.text();
    console.log('CSV content length:', csvText.length);
    console.log('First 200 chars:', csvText.substring(0, 200));
    
    const lines = csvText.split('\n').filter(line => line.trim());
    console.log('Total lines:', lines.length);
    
    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV must have at least a header and one data row' }, { status: 400 });
    }

    // Parse CSV with proper handling of quoted fields
    const entries = [];
    
    // Skip header row (assuming first row is headers)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      console.log(`Parsing line ${i}:`, line.substring(0, 100));
      
      const values = parseCSVLine(line);
      console.log(`Parsed values for line ${i}:`, values.length, 'fields');
      
      if (values.length >= 2) {
        const entry = {
          question: cleanField(values[0]),
          answer: cleanField(values[1]),
          keywords: cleanField(values[2] || '')
        };
        
        console.log('Created entry:', {
          question: entry.question.substring(0, 50),
          answer: entry.answer.substring(0, 50),
          keywords: entry.keywords
        });
        
        entries.push(entry);
      }
    }

    console.log('Total entries parsed:', entries.length);

    if (entries.length === 0) {
      return NextResponse.json({ error: 'No valid entries found in CSV' }, { status: 400 });
    }

    // Insert entries into database using Supabase MCP
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    let insertedCount = 0;
    
    for (const entry of entries) {
      try {
        // Escape single quotes for SQL
        const escapedQuestion = entry.question.replace(/'/g, "''");
        const escapedAnswer = entry.answer.replace(/'/g, "''");
        const escapedKeywords = entry.keywords.replace(/'/g, "''");
        
        const query = `INSERT INTO knowledge_entries (product, question, answer, keywords, created_at) VALUES ('${product}', '${escapedQuestion}', '${escapedAnswer}', '${escapedKeywords}', NOW());`;
        
        const command = `manus-mcp-cli tool call execute_sql --server supabase --input '{"project_id": "${SUPABASE_PROJECT_ID}", "query": "${query}"}'`;
        
        console.log('Executing SQL for entry:', entry.question.substring(0, 30));
        const result = await execAsync(command);
        console.log('SQL result:', result.stdout);
        
        insertedCount++;
      } catch (error) {
        console.error('Error inserting entry:', error);
        console.error('Failed entry:', entry.question.substring(0, 50));
      }
    }

    console.log('Successfully inserted:', insertedCount, 'entries');

    return NextResponse.json({ 
      success: true, 
      count: insertedCount,
      message: `Successfully uploaded ${insertedCount} entries`
    });

  } catch (error) {
    console.error('Error processing CSV upload:', error);
    return NextResponse.json({ 
      error: 'Failed to process CSV upload: ' + error.message 
    }, { status: 500 });
  }
}

// Improved CSV line parser that properly handles quoted fields with commas
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  let i = 0;
  
  while (i < line.length) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        // Handle escaped quotes ("")
        current += '"';
        i += 2;
        continue;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current);
      current = '';
      i++;
      continue;
    } else {
      current += char;
    }
    
    i++;
  }
  
  // Add the last field
  result.push(current);
  
  return result;
}

// Clean and trim field values
function cleanField(value) {
  if (!value) return '';
  
  // Remove surrounding quotes and trim
  let cleaned = value.trim();
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    cleaned = cleaned.slice(1, -1);
  }
  
  // Handle escaped quotes
  cleaned = cleaned.replace(/""/g, '"');
  
  return cleaned.trim();
}
