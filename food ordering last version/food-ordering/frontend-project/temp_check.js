const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/Menu.jsx');
const content = fs.readFileSync(filePath, 'utf8');

// Check for common JSX syntax issues
let issues = [];
let lineNum = 1;
let jsxTagStack = [];

// Split content by lines for line-by-line analysis
const lines = content.split('\n');

// Count JSX opening and closing tags
const openTags = (content.match(/<[A-Za-z][^/>]*(?<!\/)\s*>/g) || []).length;
const closeTags = (content.match(/<\/[A-Za-z][^>]*>/g) || []).length;
const selfClosingTags = (content.match(/<[A-Za-z][^>]*\/\s*>/g) || []).length;

console.log('=== JSX Syntax Analysis ===\n');
console.log('File: ' + filePath);
console.log('Lines: ' + lines.length);
console.log('Total content length: ' + content.length + ' characters\n');

// Check for imports
console.log('=== Imports ===');
const importLines = lines.filter(line => line.trim().startsWith('import '));
if (importLines.length === 0) {
  issues.push('WARNING: No import statements found');
  console.log('No import statements found');
} else {
  importLines.forEach((imp, idx) => {
    console.log((idx + 1) + ': ' + imp.substring(0, 100));
  });
}

// Check JSX tags balance
console.log('\n=== JSX Tags ===');
console.log('Opening tags: ' + openTags);
console.log('Closing tags: ' + closeTags);
console.log('Self-closing tags: ' + selfClosingTags);

// Check for unclosed tags by looking at common patterns
console.log('\n=== Unclosed Tag Check ===');
const tagPattern = /<([A-Za-z][A-Za-z0-9]*)[^>]*(?<!\/)\s*>/g;
const closingPattern = /<\/[A-Za-z][A-Za-z0-9]*>/g;

let match;
let openTagsList = [];
while ((match = tagPattern.exec(content)) !== null) {
  openTagsList.push(match[1]);
}

let closeTagsList = [];
const closingRegex = /<\/([A-Za-z][A-Za-z0-9]*)>/g;
while ((match = closingRegex.exec(content)) !== null) {
  closeTagsList.push(match[1]);
}

console.log('Found open tags: ' + openTagsList.slice(0, 20).join(', ') + (openTagsList.length > 20 ? '...' : ''));

// Check for common React issues
console.log('\n=== React Specific Checks ===');
if (content.includes('useState') && !content.includes('import { useState')) {
  issues.push('ERROR: useState used but not imported');
}
if (content.includes('useEffect') && !content.includes('import { useEffect')) {
  issues.push('ERROR: useEffect used but not imported');
}

// Check for unclosed fragments
const fragmentOpen = (content.match(/<>/g) || []).length;
const fragmentClose = (content.match(/<\/>/g) || []).length;
if (fragmentOpen !== fragmentClose) {
  issues.push('WARNING: Unclosed React fragments detected (opens: ' + fragmentOpen + ', closes: ' + fragmentClose + ')');
}

// Check for closing without opening
const commonElements = ['div', 'span', 'p', 'button', 'form', 'input', 'label', 'section', 'article', 'main'];
console.log('Checking element balance...');
for (const elem of commonElements) {
  const opens = (content.match(new RegExp('<' + elem + '[^>]*(?<!\/)\s*>', 'g')) || []).length;
  const closes = (content.match(new RegExp('<\/' + elem + '>', 'g')) || []).length;
  if (opens > 0 || closes > 0) {
    if (opens !== closes) {
      issues.push('WARNING: <' + elem + '> tag mismatch (opens: ' + opens + ', closes: ' + closes + ')');
    }
  }
}

// Check for syntax errors (basic checks)
console.log('\n=== Syntax Issues ===');
if (issues.length === 0) {
  console.log(' No obvious syntax issues detected');
} else {
  console.log('Issues found:');
  issues.forEach((issue, idx) => {
    console.log((idx + 1) + '. ' + issue);
  });
}

console.log('\n=== Export Check ===');
if (content.includes('export default') || content.includes('export ')) {
  console.log(' Export statement found');
} else {
  console.log(' No export statement found');
}
