// Quick syntax check for restaurant setup page
const fs = require('fs');

const content = fs.readFileSync('/Users/san/Documents/hera-erp/frontend/app/setup/restaurant/page.tsx', 'utf8');

// Check for basic syntax issues
const issues = [];

// Check for unclosed JSX tags
const openTags = content.match(/<[a-zA-Z][^>]*>/g) || [];
const closeTags = content.match(/<\/[a-zA-Z][^>]*>/g) || [];
const selfClosingTags = content.match(/<[a-zA-Z][^>]*\/>/g) || [];

console.log('Open tags:', openTags.length);
console.log('Close tags:', closeTags.length); 
console.log('Self-closing tags:', selfClosingTags.length);

// Check for matching braces
const openBraces = (content.match(/\{/g) || []).length;
const closeBraces = (content.match(/\}/g) || []).length;

console.log('Open braces: {', openBraces);
console.log('Close braces: }', closeBraces);

// Check for matching parentheses
const openParens = (content.match(/\(/g) || []).length;
const closeParens = (content.match(/\)/g) || []).length;

console.log('Open parens: (', openParens);
console.log('Close parens: )', closeParens);

// Check for unclosed string literals
const singleQuotes = (content.match(/'/g) || []).length;
const doubleQuotes = (content.match(/"/g) || []).length;
const backticks = (content.match(/`/g) || []).length;

console.log('Single quotes:', singleQuotes);
console.log('Double quotes:', doubleQuotes);
console.log('Backticks:', backticks);

// Look for the specific area around line 332
const lines = content.split('\n');
console.log('\nArea around line 332:');
for (let i = 329; i <= 335; i++) {
  if (lines[i]) {
    console.log(`${i + 1}: ${lines[i]}`);
  }
}

console.log('\nSyntax check complete');