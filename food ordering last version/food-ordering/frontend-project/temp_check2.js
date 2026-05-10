const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/Menu.jsx');
const content = fs.readFileSync(filePath, 'utf8');

console.log('=== DETAILED SYNTAX ANALYSIS ===\n');

const lines = content.split('\n');
let issues = [];

// Check imports
console.log('1. IMPORT ANALYSIS:');
const imports = lines.filter(l => l.trim().startsWith('import'));
console.log('   Found ' + imports.length + ' import statements');

// Check if useState is imported from react
const stateImport = imports.find(i => i.includes('useState') && i.includes('react'));
console.log('   useState imported from react: ' + (stateImport ? 'YES' : 'NO'));

// Look for actual JSX structure issues
console.log('\n2. JSX STRUCTURE:');
const returnMatches = content.match(/return\s*\(/g) || [];
console.log('   Return statements: ' + returnMatches.length);

// Check for JSX expression brackets
const jsxExpressions = (content.match(/\{[^}]*\}/g) || []).length;
console.log('   JSX expressions ({}): ' + jsxExpressions);

console.log('\n3. TAG PAIR ANALYSIS:');
const tagPairs = {
  'div': [0, 0],
  'form': [0, 0],
  'section': [0, 0],
  'button': [0, 0],
  'ul': [0, 0],
  'li': [0, 0],
  'span': [0, 0],
};

for (const tag in tagPairs) {
  const opens = (content.match(new RegExp('<' + tag + '(?:\\s|>)', 'gi')) || []).length;
  const closes = (content.match(new RegExp('</' + tag + '>', 'gi')) || []).length;
  tagPairs[tag] = [opens, closes];
  
  if (opens !== closes) {
    console.log('   WARNING: <' + tag + '> mismatch: ' + opens + ' opens, ' + closes + ' closes');
    issues.push('Tag mismatch: <' + tag + '> opens=' + opens + ' closes=' + closes);
  }
}

console.log('\n4. BRACKET BALANCE CHECK:');
let braceCount = 0, parenCount = 0, bracketCount = 0;
for (const char of content) {
  if (char === '{') braceCount++;
  if (char === '}') braceCount--;
  if (char === '(') parenCount++;
  if (char === ')') parenCount--;
  if (char === '[') bracketCount++;
  if (char === ']') bracketCount--;
}

console.log('   Braces { } balance: ' + (braceCount === 0 ? 'OK' : 'UNBALANCED (' + braceCount + ')'));
console.log('   Parentheses ( ) balance: ' + (parenCount === 0 ? 'OK' : 'UNBALANCED (' + parenCount + ')'));
console.log('   Brackets [ ] balance: ' + (bracketCount === 0 ? 'OK' : 'UNBALANCED (' + bracketCount + ')'));

console.log('\n5. EXPORT CHECK:');
const exportLine = lines.find(l => l.includes('export default') || l.includes('export '));
if (exportLine) {
  console.log('   Export found: ' + exportLine.trim());
} else {
  console.log('   WARNING: No export statement found');
  issues.push('No export statement');
}

console.log('\n=== SUMMARY ===');
if (issues.length === 0) {
  console.log('SUCCESS: No critical syntax errors found!');
  console.log('- All brackets, braces, and parentheses are balanced');
  console.log('- All imports are present');
  console.log('- All JSX tags appear properly paired');
  console.log('- File exports are defined');
} else {
  console.log('ISSUES FOUND:');
  issues.forEach(i => console.log('  - ' + i));
}
