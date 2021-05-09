const fs = require('fs');
const eslintPlugin = require('@tkww-assistant/eslint-plugin');

const plugin = eslintPlugin.default || eslintPlugin;

if (!plugin) {
  const writeBuffer = Buffer.from(`\n@tkww-assistant/eslint-plugin failed to install.\n`, 'utf-8');
  console.log('~ writeBuffer', writeBuffer);
  process.stdout.write(writeBuffer);
  process.exit(1);
}

// Clean up folder
const localFiles = fs.readdirSync('./');

// Do not delete these items
const exclude = [
  'build',
  'package.json',
];

localFiles.forEach((file) => {
  if (!exclude.includes(file)) {
    fs.unlinkSync(file);
  }
});

// Common text applied to each file or rule
const lead = `module.exports = {\n  rules: {\n`;
const ruleLead = `    '@tkww-assistant/`;
const ruleTail = `': 2,\n`;
const tail = `  },\n};\n`;

let all = lead;
let type = lead;
let redux = lead;

for (const rule in plugin.rules) {
  // if (rule.includes('type' ))
  if (rule.startsWith('redux')) {
    redux = `${redux}${ruleLead}${rule}${ruleTail}`;
  }
  all = `${all}${ruleLead}${rule}${ruleTail}`;
}

redux = `${redux}${tail}`;
all = `${all}${tail}`;

// Write rule configs
fs.writeFileSync('./all.js', all);
fs.writeFileSync('./redux.js', redux);
