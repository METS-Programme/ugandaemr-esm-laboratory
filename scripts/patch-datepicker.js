const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../node_modules/@openmrs/esm-styleguide/src/datepicker/index.tsx');

if (!fs.existsSync(filePath)) {
  console.log('DatePicker file not found, skipping patch');
  process.exit(0);
}

let content = fs.readFileSync(filePath, 'utf8');

// Check if the patch has already been applied
if (content.includes('isReadOnly: props.isReadOnly')) {
  console.log('DatePicker already patched');
  process.exit(0);
}

// Find the values object in the useRenderProps call for DatePicker
// and add the missing properties
const searchPattern = /(isOpen: state\.isOpen,?\s*\n\s*}\),)/;

const replacement = `isOpen: state.isOpen,
        isReadOnly: props.isReadOnly || false,
        isRequired: props.isRequired || false,
      }),`;

if (content.match(searchPattern)) {
  content = content.replace(searchPattern, replacement);
  fs.writeFileSync(filePath, content);
  console.log('✅ Patched DatePicker to add isReadOnly and isRequired');
} else {
  console.log('⚠️  Could not find the pattern to patch in DatePicker');
  console.log('The file structure may have changed');
  process.exit(1);
}
