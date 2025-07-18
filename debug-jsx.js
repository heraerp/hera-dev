const fs = require('fs');

const content = fs.readFileSync('/Users/san/Documents/hera-erp/frontend/app/setup/restaurant/page.tsx', 'utf8');
const lines = content.split('\n');

// Find the problematic conditional blocks
const conditionalStarts = [450, 557, 651, 736];

conditionalStarts.forEach(start => {
  console.log(`\n=== Checking conditional block starting at line ${start} ===`);
  
  // Find the matching closing )}
  let depth = 0;
  let found = false;
  
  for (let i = start - 1; i < lines.length; i++) {
    const line = lines[i];
    
    // Count opening and closing for JSX conditional patterns
    if (line.includes('&& (')) {
      depth++;
      console.log(`Line ${i + 1}: OPEN - ${line.trim()}`);
    }
    
    if (line.includes(')}')) {
      depth--;
      console.log(`Line ${i + 1}: CLOSE - ${line.trim()}`);
      if (depth === 0) {
        console.log(`Block closes at line ${i + 1}`);
        found = true;
        break;
      }
    }
    
    // Show first few lines and around potential issues
    if (i < start + 5 || i > start + 100) {
      // continue;
    } else {
      // console.log(`Line ${i + 1}: ${line}`);
    }
  }
  
  if (!found) {
    console.log('ERROR: No matching closing found!');
  }
});

console.log('\n=== Checking for mismatched JSX tags in specific sections ===');

// Check for unclosed JSX elements in the problematic areas
[545, 640, 725].forEach(lineNum => {
  console.log(`\nChecking around line ${lineNum}:`);
  for (let i = lineNum - 5; i <= lineNum + 10; i++) {
    if (lines[i]) {
      console.log(`${i + 1}: ${lines[i]}`);
    }
  }
});